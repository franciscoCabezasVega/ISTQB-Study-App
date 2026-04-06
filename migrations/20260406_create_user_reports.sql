-- Migration: Create user_reports table and check_report_rate_limit RPC
-- This migration creates the user reporting system used by ReportService.
-- Already applied in production Supabase (pygermjcpomedeyujiut).

-- 1. Create the user_reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('question_error', 'system_bug', 'suggestion', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  question_id UUID NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT NULL,
  admin_notes TEXT NULL,
  resolved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON public.user_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON public.user_reports(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: users can only read/create their own reports
CREATE POLICY "Users can view their own reports"
  ON public.user_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.user_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Rate-limit RPC function
-- Returns TRUE if user can submit (< 10 reports in the last hour), FALSE otherwise.
CREATE OR REPLACE FUNCTION public.check_report_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM user_reports
  WHERE user_id = p_user_id
    AND created_at > now() - INTERVAL '1 hour';
  RETURN recent_count < 10;
END;
$$;

-- 6. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_report_rate_limit(UUID) TO authenticated;

-- 7. Auto-update updated_at on row changes
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
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_reports_updated_at();
