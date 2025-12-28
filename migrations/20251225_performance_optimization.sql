-- Migration: Performance Optimization for RLS Policies
-- Date: 2025-12-25
-- Description: Optimiza políticas RLS para evitar re-evaluación de auth.uid() en cada fila

-- ==========================================
-- OPTIMIZACIÓN: auth.uid() → (SELECT auth.uid())
-- ==========================================

-- Tabla: spaced_repetition_cards
DROP POLICY IF EXISTS "Users can view their own spaced repetition cards" ON public.spaced_repetition_cards;
DROP POLICY IF EXISTS "Users can insert their own spaced repetition cards" ON public.spaced_repetition_cards;
DROP POLICY IF EXISTS "Users can update their own spaced repetition cards" ON public.spaced_repetition_cards;
DROP POLICY IF EXISTS "Users can delete their own spaced repetition cards" ON public.spaced_repetition_cards;

CREATE POLICY "Users can view their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own spaced repetition cards"
  ON public.spaced_repetition_cards
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Tabla: study_reminders
DROP POLICY IF EXISTS "Users can view their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can insert their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can update their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can delete their own study reminders" ON public.study_reminders;

CREATE POLICY "Users can view their own study reminders"
  ON public.study_reminders
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own study reminders"
  ON public.study_reminders
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own study reminders"
  ON public.study_reminders
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own study reminders"
  ON public.study_reminders
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Tabla: user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_progress;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.user_progress
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ==========================================
-- COMENTARIOS: Documentar optimizaciones
-- ==========================================

COMMENT ON POLICY "Users can view their own spaced repetition cards" ON public.spaced_repetition_cards 
IS 'Performance fix: Usa (SELECT auth.uid()) para evitar re-evaluación por fila';

COMMENT ON POLICY "Users can view their own study reminders" ON public.study_reminders 
IS 'Performance fix: Usa (SELECT auth.uid()) para evitar re-evaluación por fila';

COMMENT ON POLICY "Users can view their own progress" ON public.user_progress 
IS 'Performance fix: Usa (SELECT auth.uid()) para evitar re-evaluación por fila';
