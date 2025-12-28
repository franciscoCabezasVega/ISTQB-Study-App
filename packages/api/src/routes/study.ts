import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import StudyService from '../services/StudyService';
import AchievementService from '../services/AchievementService';

const router = Router();

/**
 * POST /study/answers
 * Registra una respuesta en modo estudio
 * NOTA: timeSpentSeconds es opcional, por defecto 0
 */
router.post('/answers', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { questionId, selectedOptions, isCorrect, timeSpentSeconds, attemptNumber } = req.body;

    const answer = await StudyService.recordStudyAnswer(
      req.user.id,
      questionId,
      selectedOptions,
      isCorrect,
      timeSpentSeconds || 0, // Default a 0 si no se proporciona
      attemptNumber || 1
    );

    // Actualizar streak y verificar logros (asíncrono, no bloquea la respuesta)
    AchievementService.updateStreak(req.user.id).catch(console.error);
    AchievementService.checkAndUnlockAchievements(req.user.id).catch(console.error);

    res.status(201).json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /study/session
 * Obtiene o crea una sesión de estudio activa
 */
router.get('/session', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { topic, difficulty } = req.query;
    
    const session = await StudyService.getOrCreateStudySession(
      req.user.id,
      topic as string,
      difficulty as string
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /study/session/:sessionId/complete
 * Completa una sesión de estudio
 */
router.post('/session/:sessionId/complete', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sessionId } = req.params;
    const session = await StudyService.completeStudySession(sessionId);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /study/history
 * Obtiene el historial de respuestas en modo estudio
 */
router.get('/history', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { limit } = req.query;
    const answers = await StudyService.getStudyAnswerHistory(
      req.user.id,
      parseInt(limit as string) || 50
    );

    res.status(200).json({
      success: true,
      data: answers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /study/errors
 * Obtiene las respuestas incorrectas en modo estudio (banco de errores)
 */
router.get('/errors', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const errors = await StudyService.getIncorrectStudyAnswers(req.user.id);
    
    res.status(200).json({
      success: true,
      data: errors,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /study/sessions
 * Obtiene las sesiones de estudio del usuario
 */
router.get('/sessions', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { limit } = req.query;
    const sessions = await StudyService.getUserStudySessions(
      req.user.id,
      parseInt(limit as string) || 20
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /study/stats
 * Obtiene estadísticas de estudio del usuario
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stats = await StudyService.getStudyStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
