-- =============================================================
-- ISTQB Study App — Initial Schema
-- Snapshot of production Supabase (pygermjcpomedeyujiut)
-- Captured: 2026-04-06
-- =============================================================
-- Run this once on a fresh Supabase project to reproduce the
-- full database schema: tables, indexes, RLS policies, functions
-- and triggers. Extensions are enabled by Supabase by default.
-- =============================================================

-- Prerequisites (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 1. TABLES
-- =============================================================

-- ------------------------------------------------------------
-- users
-- Mirrors auth.users; stores app-level profile data.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  language    TEXT DEFAULT 'es',
  theme       TEXT DEFAULT 'light',
  timezone    TEXT NOT NULL DEFAULT 'UTC',
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- questions
-- Bilingual question bank (ES + EN).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type               TEXT NOT NULL,
  topic              TEXT NOT NULL,
  correct_answer_ids TEXT[] NOT NULL,
  title_es           TEXT,
  description_es     TEXT,
  options_es         JSONB,
  title_en           TEXT,
  description_en     TEXT,
  options_en         JSONB,
  image_url          TEXT,
  created_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- achievements
-- Catalog of available achievements (badges).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code           TEXT NOT NULL UNIQUE,
  icon           TEXT,
  criteria       JSONB,
  name_es        TEXT,
  description_es TEXT,
  name_en        TEXT,
  description_en TEXT,
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- user_achievements
-- Many-to-many: which achievements each user has unlocked.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, achievement_id)
);

-- ------------------------------------------------------------
-- daily_streaks
-- One row per user tracking study streak counters.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_study_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- study_sessions
-- A study session groups answers for a topic/difficulty combo.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic            TEXT,
  difficulty       TEXT,
  questions_count  INTEGER DEFAULT 0,
  correct_answers  INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active',
  started_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- study_answers
-- Individual answers recorded during study sessions.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_answers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id      UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_options TEXT[] NOT NULL,
  is_correct       BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  answered_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  attempt_number   INTEGER DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- exam_sessions
-- A full 40-question timed exam session.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions       JSONB NOT NULL,
  score           INTEGER,
  total_questions INTEGER,
  total_time_spent INTEGER,
  difficulty      TEXT,
  status          TEXT DEFAULT 'in_progress',
  is_completed    BOOLEAN DEFAULT false,
  started_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- exam_answers
-- Individual answers recorded during exam sessions.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer_id TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (exam_session_id, question_id)
);

-- ------------------------------------------------------------
-- user_progress
-- Aggregated per-topic progress stats per user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic            TEXT,
  total_questions  INTEGER DEFAULT 0,
  correct_answers  INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  success_rate     NUMERIC DEFAULT 0,
  last_studied     TIMESTAMPTZ,
  UNIQUE (user_id, topic)
);

-- ------------------------------------------------------------
-- spaced_repetition_cards
-- SM-2 algorithm state per user per question.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spaced_repetition_cards (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id      UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  ease_factor      NUMERIC DEFAULT 2.5,
  interval         INTEGER DEFAULT 1,
  repetitions      INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ,
  last_reviewed    TIMESTAMPTZ,
  UNIQUE (user_id, question_id)
);

-- ------------------------------------------------------------
-- study_reminders
-- User-configured study reminder settings.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_reminders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency      TEXT NOT NULL,
  preferred_time TEXT,
  enabled        BOOLEAN DEFAULT true,
  custom_days    INTEGER[],
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- reminder_logs
-- Audit log of sent reminder emails/notifications.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id   UUID NOT NULL REFERENCES public.study_reminders(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email_id      TEXT,
  status        TEXT NOT NULL,
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- user_reports
-- User-submitted bug reports and suggestions.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('question_error', 'system_bug', 'suggestion', 'other')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  question_id UUID,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url    TEXT,
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 2. INDEXES
-- =============================================================

CREATE UNIQUE INDEX IF NOT EXISTS achievements_code_key ON public.achievements (code);

CREATE UNIQUE INDEX IF NOT EXISTS daily_streaks_user_id_key ON public.daily_streaks (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_id ON public.daily_streaks (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS exam_answers_exam_session_id_question_id_key ON public.exam_answers (exam_session_id, question_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_session ON public.exam_answers (exam_session_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_question_id ON public.exam_answers (question_id);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON public.exam_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions (topic);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder_id ON public.reminder_logs (reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_sent_at ON public.reminder_logs (sent_at);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status ON public.reminder_logs (status);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id_active ON public.reminder_logs (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS spaced_repetition_cards_user_id_question_id_key ON public.spaced_repetition_cards (user_id, question_id);

CREATE INDEX IF NOT EXISTS idx_study_answers_user_id ON public.study_answers (user_id);
CREATE INDEX IF NOT EXISTS idx_study_answers_study_session_id ON public.study_answers (study_session_id);
CREATE INDEX IF NOT EXISTS idx_study_answers_question_id ON public.study_answers (question_id);

CREATE INDEX IF NOT EXISTS idx_study_reminders_user_id ON public.study_reminders (user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id_active ON public.study_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_status ON public.study_sessions (status);

CREATE UNIQUE INDEX IF NOT EXISTS user_achievements_user_id_achievement_id_key ON public.user_achievements (user_id, achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements (achievement_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_topic_unique ON public.user_progress (user_id, topic);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON public.user_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports (status);
CREATE INDEX IF NOT EXISTS idx_user_reports_type ON public.user_reports (type);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON public.user_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_question ON public.user_reports (question_id) WHERE question_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON public.users (email);

-- =============================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.achievements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_repetition_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_answers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_reminders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;

-- achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT USING (true);

-- daily_streaks
CREATE POLICY "Users can view their own streak"
  ON public.daily_streaks FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert their own streak"
  ON public.daily_streaks FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own streak"
  ON public.daily_streaks FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- exam_sessions
CREATE POLICY "users_view_own_exam_sessions"
  ON public.exam_sessions FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "users_insert_own_exam_sessions"
  ON public.exam_sessions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "users_update_own_exam_sessions"
  ON public.exam_sessions FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- exam_answers
CREATE POLICY "users_view_own_exam_answers"
  ON public.exam_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exam_sessions
    WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.user_id = (SELECT auth.uid())
  ));
CREATE POLICY "users_insert_own_exam_answers"
  ON public.exam_answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM exam_sessions
    WHERE exam_sessions.id = exam_answers.exam_session_id
      AND exam_sessions.user_id = (SELECT auth.uid())
  ));

-- questions (public read; write open for seeding — tighten in production)
CREATE POLICY "Allow public read"   ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.questions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.questions FOR DELETE USING (true);

-- reminder_logs
CREATE POLICY "Users can view their own reminder logs"
  ON public.reminder_logs FOR SELECT USING (user_id = (SELECT auth.uid()));

-- spaced_repetition_cards
CREATE POLICY "Users can view their own spaced repetition cards"
  ON public.spaced_repetition_cards FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert their own spaced repetition cards"
  ON public.spaced_repetition_cards FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update their own spaced repetition cards"
  ON public.spaced_repetition_cards FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete their own spaced repetition cards"
  ON public.spaced_repetition_cards FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- study_answers
CREATE POLICY "Users can view their own study answers"
  ON public.study_answers FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own study answers"
  ON public.study_answers FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- study_reminders
CREATE POLICY "Users can view their own study reminders"
  ON public.study_reminders FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert their own study reminders"
  ON public.study_reminders FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update their own study reminders"
  ON public.study_reminders FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete their own study reminders"
  ON public.study_reminders FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- study_sessions
CREATE POLICY "Users can view their own study sessions"
  ON public.study_sessions FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own study sessions"
  ON public.study_sessions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own study sessions"
  ON public.study_sessions FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete their own progress"
  ON public.user_progress FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- user_reports
CREATE POLICY "users_select_own_reports"
  ON public.user_reports FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_insert_own_reports"
  ON public.user_reports FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- users
CREATE POLICY "users_view_own"
  ON public.users FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE USING (id = (SELECT auth.uid()));

-- =============================================================
-- 4. FUNCTIONS
-- =============================================================

-- Rate limit: max 10 user reports per hour
CREATE OR REPLACE FUNCTION public.check_report_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.user_reports
  WHERE user_id = p_user_id
    AND created_at > now() - INTERVAL '1 hour';
  RETURN recent_count < 10;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_report_rate_limit(UUID) TO authenticated;

-- Combined success rate across study + exam modes
CREATE OR REPLACE FUNCTION public.get_combined_user_success_rate(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_total_questions INTEGER := 0;
  v_correct_answers INTEGER := 0;
  v_success_rate    NUMERIC := 0;
BEGIN
  SELECT COALESCE(COUNT(*), 0), COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0)
  INTO v_total_questions, v_correct_answers
  FROM public.study_answers
  WHERE user_id = p_user_id;

  SELECT COALESCE(COUNT(*), 0) + v_total_questions,
         COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) + v_correct_answers
  INTO v_total_questions, v_correct_answers
  FROM public.exam_answers ea
  INNER JOIN public.exam_sessions es ON ea.exam_session_id = es.id
  WHERE es.user_id = p_user_id;

  IF v_total_questions > 0 THEN
    v_success_rate := (v_correct_answers::NUMERIC / v_total_questions::NUMERIC) * 100;
  END IF;

  RETURN ROUND(v_success_rate, 2);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_combined_user_success_rate(UUID) TO authenticated;

-- Combined statistics by topic
CREATE OR REPLACE FUNCTION public.get_combined_user_statistics_by_topic(p_user_id UUID)
RETURNS TABLE(topic TEXT, total_questions BIGINT, correct_answers BIGINT, incorrect_answers BIGINT, success_rate NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  WITH study_question_status AS (
    SELECT sa.question_id,
           MAX(CASE WHEN sa.is_correct THEN 1 ELSE 0 END) AS ever_correct
    FROM public.study_answers sa
    WHERE sa.user_id = p_user_id
    GROUP BY sa.question_id
  ),
  stats_by_topic AS (
    SELECT q.topic,
           COUNT(DISTINCT sqs.question_id) AS total_q,
           SUM(sqs.ever_correct)           AS correct_q,
           SUM(CASE WHEN sqs.ever_correct = 0 THEN 1 ELSE 0 END) AS incorrect_q
    FROM study_question_status sqs
    INNER JOIN public.questions q ON sqs.question_id = q.id
    GROUP BY q.topic
  )
  SELECT sbt.topic,
         sbt.total_q   AS total_questions,
         sbt.correct_q AS correct_answers,
         sbt.incorrect_q AS incorrect_answers,
         CASE WHEN sbt.total_q > 0
              THEN ROUND((sbt.correct_q::NUMERIC / sbt.total_q::NUMERIC) * 100, 2)
              ELSE 0
         END AS success_rate
  FROM stats_by_topic sbt
  ORDER BY sbt.topic;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_combined_user_statistics_by_topic(UUID) TO authenticated;

-- Exam statistics summary
CREATE OR REPLACE FUNCTION public.get_exam_statistics(p_user_id UUID)
RETURNS TABLE(
  total_exams      BIGINT,
  average_score    NUMERIC,
  last_score       INTEGER,
  highest_score    INTEGER,
  exams_passed     BIGINT,
  last_exam_date   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT                                    AS total_exams,
    ROUND(AVG(score), 2)                               AS average_score,
    (SELECT score FROM exam_sessions
     WHERE user_id = p_user_id AND status = 'completed'
     ORDER BY completed_at DESC LIMIT 1)               AS last_score,
    MAX(score)                                         AS highest_score,
    COUNT(*) FILTER (WHERE score >= 65)::BIGINT        AS exams_passed,
    MAX(completed_at)                                  AS last_exam_date
  FROM exam_sessions
  WHERE user_id = p_user_id AND status = 'completed';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_exam_statistics(UUID) TO authenticated;

-- =============================================================
-- 5. TRIGGERS
-- =============================================================

-- Auto-update updated_at on study_sessions
CREATE OR REPLACE FUNCTION public.update_study_session_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_study_session_timestamp
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_study_session_timestamp();

-- Auto-update updated_at on user_reports
CREATE OR REPLACE FUNCTION public.update_user_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_reports_updated_at
  BEFORE UPDATE ON public.user_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_user_reports_updated_at();
