-- Función para obtener estadísticas de exámenes del usuario
DROP FUNCTION IF EXISTS get_exam_statistics(uuid);

CREATE OR REPLACE FUNCTION get_exam_statistics(p_user_id uuid)
RETURNS TABLE (
  total_exams bigint,
  average_score numeric,
  last_score integer,
  highest_score integer,
  exams_passed bigint,
  last_exam_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_exams,
    ROUND(AVG(score), 2) as average_score,
    (SELECT score FROM exam_sessions WHERE user_id = p_user_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1) as last_score,
    MAX(score) as highest_score,
    COUNT(*) FILTER (WHERE score >= 65)::bigint as exams_passed,
    MAX(completed_at) as last_exam_date
  FROM exam_sessions
  WHERE user_id = p_user_id
    AND status = 'completed';
END;
$$;
