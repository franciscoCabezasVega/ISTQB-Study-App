-- Migration: Fix Function Return Types
-- Date: 2025-12-25
-- Description: Corrige los tipos de retorno de las funciones para que coincidan con los tipos reales de PostgreSQL

-- ==========================================
-- FIX: get_combined_user_statistics_by_topic
-- ==========================================
-- Problema: COUNT(*) y SUM() devuelven bigint, no integer
-- Solución: Cambiar el tipo de retorno a bigint

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

-- Restaurar permisos
GRANT EXECUTE ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) FROM anon;

-- Documentación
COMMENT ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) 
IS 'Obtiene estadísticas por tema del usuario. SECURITY DEFINER con permisos para authenticated. Tipos corregidos: bigint en lugar de integer.';
