-- Migration: Fix Function Permissions
-- Date: 2025-12-25
-- Description: Otorga permisos de ejecución a las funciones RPC para usuarios autenticados

-- ==========================================
-- GRANTS para funciones RPC
-- ==========================================

-- Función: get_combined_user_success_rate
-- Permite a usuarios autenticados obtener su tasa de éxito
GRANT EXECUTE ON FUNCTION public.get_combined_user_success_rate(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_combined_user_success_rate(uuid) FROM anon;

-- Función: get_combined_user_statistics_by_topic
-- Permite a usuarios autenticados obtener estadísticas por tema
GRANT EXECUTE ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) FROM anon;

-- Función: get_question_in_language
-- Permite a usuarios autenticados obtener preguntas en su idioma
GRANT EXECUTE ON FUNCTION public.get_question_in_language(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_question_in_language(uuid, text) FROM anon;

-- ==========================================
-- Verificar permisos en tablas relacionadas
-- ==========================================

-- Asegurar que authenticated puede leer de las tablas necesarias
-- (ya deberían tener permisos por las políticas RLS, pero lo confirmamos)

-- Tabla: questions (lectura pública necesaria para el quiz)
GRANT SELECT ON public.questions TO authenticated, anon;

-- Tabla: study_answers (ya protegida por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_answers TO authenticated;
REVOKE ALL ON public.study_answers FROM anon;

-- Tabla: exam_answers (ya protegida por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_answers TO authenticated;
REVOKE ALL ON public.exam_answers FROM anon;

-- Tabla: exam_sessions (ya protegida por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_sessions TO authenticated;
REVOKE ALL ON public.exam_sessions FROM anon;

-- ==========================================
-- Comentarios de documentación
-- ==========================================

COMMENT ON FUNCTION public.get_combined_user_success_rate(uuid) 
IS 'Calcula la tasa de éxito combinada del usuario. SECURITY DEFINER con permisos para authenticated.';

COMMENT ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) 
IS 'Obtiene estadísticas por tema del usuario. SECURITY DEFINER con permisos para authenticated.';

COMMENT ON FUNCTION public.get_question_in_language(uuid, text) 
IS 'Obtiene una pregunta en el idioma especificado. SECURITY DEFINER con permisos para authenticated.';
