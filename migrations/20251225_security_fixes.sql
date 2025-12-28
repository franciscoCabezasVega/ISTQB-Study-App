-- Migration: Security Advisor Fixes
-- Date: 2025-12-25
-- Description: Resuelve todos los problemas de seguridad detectados por Supabase Security Advisor

-- ==========================================
-- 1. FIX: RLS Policies para tablas que no las tienen
-- ==========================================

-- Políticas para spaced_repetition_cards
CREATE POLICY "Users can view their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para study_reminders
CREATE POLICY "Users can view their own study reminders"
  ON public.study_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study reminders"
  ON public.study_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study reminders"
  ON public.study_reminders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study reminders"
  ON public.study_reminders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.user_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 2. FIX: Habilitar RLS en tabla achievements
-- ==========================================

-- Habilitar RLS en achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Los achievements son públicos, todos pueden leerlos
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Solo administradores pueden modificar achievements (usando service role key)
-- No creamos políticas de INSERT/UPDATE/DELETE para usuarios normales

-- ==========================================
-- 3. FIX: Function search_path mutable
-- ==========================================

-- Fix para get_combined_user_success_rate
DROP FUNCTION IF EXISTS public.get_combined_user_success_rate(uuid);
CREATE OR REPLACE FUNCTION public.get_combined_user_success_rate(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_questions integer := 0;
  v_correct_answers integer := 0;
  v_success_rate numeric := 0;
BEGIN
  -- Contar del modo estudio
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0)
  INTO v_total_questions, v_correct_answers
  FROM public.study_answers
  WHERE user_id = p_user_id;
  
  -- Agregar del modo examen
  SELECT 
    COALESCE(COUNT(*), 0) + v_total_questions,
    COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) + v_correct_answers
  INTO v_total_questions, v_correct_answers
  FROM public.exam_answers ea
  INNER JOIN public.exam_sessions es ON ea.exam_session_id = es.id
  WHERE es.user_id = p_user_id;
  
  -- Calcular tasa de éxito
  IF v_total_questions > 0 THEN
    v_success_rate := (v_correct_answers::numeric / v_total_questions::numeric) * 100;
  END IF;
  
  RETURN ROUND(v_success_rate, 2);
END;
$$;

-- Fix para update_study_session_timestamp
-- No necesitamos DROP porque estamos usando CREATE OR REPLACE
CREATE OR REPLACE FUNCTION public.update_study_session_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Fix para get_combined_user_statistics_by_topic
DROP FUNCTION IF EXISTS public.get_combined_user_statistics_by_topic(uuid);
CREATE OR REPLACE FUNCTION public.get_combined_user_statistics_by_topic(p_user_id uuid)
RETURNS TABLE (
  topic text,
  total_questions bigint,
  correct_answers bigint,
  incorrect_answers bigint,
  success_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH study_stats AS (
    SELECT 
      q.topic,
      COUNT(*) as total_q,
      SUM(CASE WHEN sa.is_correct THEN 1 ELSE 0 END) as correct_q,
      SUM(CASE WHEN NOT sa.is_correct THEN 1 ELSE 0 END) as incorrect_q
    FROM public.study_answers sa
    INNER JOIN public.questions q ON sa.question_id = q.id
    WHERE sa.user_id = p_user_id
    GROUP BY q.topic
  ),
  exam_stats AS (
    SELECT 
      q.topic,
      COUNT(*) as total_q,
      SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct_q,
      SUM(CASE WHEN NOT ea.is_correct THEN 1 ELSE 0 END) as incorrect_q
    FROM public.exam_answers ea
    INNER JOIN public.exam_sessions es ON ea.exam_session_id = es.id
    INNER JOIN public.questions q ON ea.question_id = q.id
    WHERE es.user_id = p_user_id
    GROUP BY q.topic
  ),
  combined AS (
    SELECT 
      COALESCE(ss.topic, es.topic) as topic,
      COALESCE(ss.total_q, 0) + COALESCE(es.total_q, 0) as total_questions,
      COALESCE(ss.correct_q, 0) + COALESCE(es.correct_q, 0) as correct_answers,
      COALESCE(ss.incorrect_q, 0) + COALESCE(es.incorrect_q, 0) as incorrect_answers
    FROM study_stats ss
    FULL OUTER JOIN exam_stats es ON ss.topic = es.topic
  )
  SELECT 
    c.topic,
    c.total_questions,
    c.correct_answers,
    c.incorrect_answers,
    CASE 
      WHEN c.total_questions > 0 THEN ROUND((c.correct_answers::numeric / c.total_questions::numeric) * 100, 2)
      ELSE 0
    END as success_rate
  FROM combined c
  ORDER BY c.topic;
END;
$$;

-- Fix para get_question_in_language
DROP FUNCTION IF EXISTS public.get_question_in_language(uuid, text);
CREATE OR REPLACE FUNCTION public.get_question_in_language(
  p_question_id uuid,
  p_language text
)
RETURNS TABLE (
  id uuid,
  type text,
  topic text,
  title text,
  description text,
  options jsonb,
  correct_answer_ids text[],
  explanation text,
  difficulty text,
  istqb_reference text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_language = 'en' THEN
    RETURN QUERY
    SELECT 
      q.id,
      q.type,
      q.topic,
      q.title_en as title,
      q.description_en as description,
      q.options_en as options,
      q.correct_answer_ids,
      q.explanation_en as explanation,
      q.difficulty_en as difficulty,
      q.istqb_reference
    FROM public.questions q
    WHERE q.id = p_question_id;
  ELSE
    RETURN QUERY
    SELECT 
      q.id,
      q.type,
      q.topic,
      q.title_es as title,
      q.description_es as description,
      q.options_es as options,
      q.correct_answer_ids,
      q.explanation_es as explanation,
      q.difficulty_es as difficulty,
      q.istqb_reference
    FROM public.questions q
    WHERE q.id = p_question_id;
  END IF;
END;
$$;

-- ==========================================
-- GRANTS: Asegurar permisos adecuados
-- ==========================================

-- Revocar permisos innecesarios
REVOKE ALL ON public.achievements FROM anon, authenticated;

-- Otorgar permisos específicos
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.spaced_repetition_cards TO authenticated;
GRANT ALL ON public.study_reminders TO authenticated;
GRANT ALL ON public.user_progress TO authenticated;

-- ==========================================
-- COMENTARIOS: Documentar cambios
-- ==========================================

COMMENT ON POLICY "Users can view their own spaced repetition cards" ON public.spaced_repetition_cards 
IS 'Security fix: Permite a los usuarios ver solo sus propias tarjetas de repetición espaciada';

COMMENT ON POLICY "Users can view their own study reminders" ON public.study_reminders 
IS 'Security fix: Permite a los usuarios ver solo sus propios recordatorios';

COMMENT ON POLICY "Users can view their own progress" ON public.user_progress 
IS 'Security fix: Permite a los usuarios ver solo su propio progreso';

COMMENT ON POLICY "Anyone can view achievements" ON public.achievements 
IS 'Security fix: Los logros son públicos pero solo modificables por administradores';

COMMENT ON FUNCTION public.get_combined_user_success_rate(uuid) 
IS 'Security fix: search_path fijado para prevenir ataques de escalación de privilegios';

COMMENT ON FUNCTION public.update_study_session_timestamp() 
IS 'Security fix: search_path fijado para prevenir ataques de escalación de privilegios';

COMMENT ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) 
IS 'Security fix: search_path fijado para prevenir ataques de escalación de privilegios';

COMMENT ON FUNCTION public.get_question_in_language(uuid, text) 
IS 'Security fix: search_path fijado para prevenir ataques de escalación de privilegios';
