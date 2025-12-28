import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import { AnswerService } from '../services/AnswerService';
import AchievementService from '../services/AchievementService';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * POST /answers
 * DEPRECADO - Las respuestas ahora se registran a través de:
 * - /exam/submit (para exámenes)
 * - /study/answer (para sesiones de estudio)
 */
router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    return res.status(410).json({ 
      message: 'Este endpoint está deprecado. Usa /exam/submit o /study/answer',
      deprecated: true
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /answers/history
 * Obtiene el historial combinado de respuestas del usuario
 */
router.get('/history', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { limit } = req.query;
    const maxLimit = parseInt(limit as string) || 50;

    // Obtener respuestas de estudio
    const { data: studyAnswers } = await supabase
      .from('study_answers')
      .select('*, questions(title_es, title_en, topic)')
      .eq('user_id', req.user.id)
      .order('answered_at', { ascending: false })
      .limit(maxLimit);

    // Obtener respuestas de exámenes
    const { data: examAnswers } = await supabase
      .from('exam_answers')
      .select('*, questions(title_es, title_en, topic), exam_sessions!inner(user_id)')
      .eq('exam_sessions.user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(maxLimit);

    // Combinar y ordenar por fecha
    const combined = [
      ...(studyAnswers || []).map(a => ({ ...a, type: 'study', date: a.answered_at })),
      ...(examAnswers || []).map(a => ({ ...a, type: 'exam', date: a.created_at }))
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxLimit);

    res.status(200).json(combined);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /answers/errors
 * Obtiene las respuestas incorrectas (banco de errores)
 */
router.get('/errors', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Obtener respuestas incorrectas de estudio
    const { data: studyErrors } = await supabase
      .from('study_answers')
      .select('*, questions(title_es, title_en, topic, explanation_es, explanation_en)')
      .eq('user_id', req.user.id)
      .eq('is_correct', false)
      .order('answered_at', { ascending: false });

    // Obtener respuestas incorrectas de exámenes
    const { data: examErrors } = await supabase
      .from('exam_answers')
      .select('*, questions(title_es, title_en, topic, explanation_es, explanation_en), exam_sessions!inner(user_id)')
      .eq('exam_sessions.user_id', req.user.id)
      .eq('is_correct', false)
      .order('created_at', { ascending: false });

    // Combinar
    const combined = [
      ...(studyErrors || []).map(a => ({ ...a, type: 'study', date: a.answered_at })),
      ...(examErrors || []).map(a => ({ ...a, type: 'exam', date: a.created_at }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json(combined);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /answers/statistics
 * Obtiene las estadísticas de respuestas del usuario
 */
router.get('/statistics', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const successRate = await AnswerService.getSuccessRate(req.user.id);
    const statisticsByTopic = await AnswerService.getStatisticsByTopic(req.user.id);
    const examStatistics = await AnswerService.getExamStatistics(req.user.id);

    res.status(200).json({
      successRate,
      statisticsByTopic,
      examStatistics,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
