import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import AchievementService from '../services/AchievementService';
import { Language } from '@istqb-app/shared';

const router = Router();

/**
 * GET /api/achievements
 * Obtener todos los logros disponibles en el idioma especificado
 * Query params: language (opcional, default: 'es')
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const language = (req.query.language as Language) || 'es';
    const achievements = await AchievementService.getAllAchievements(language);

    res.status(200).json({
      statusCode: 200,
      data: achievements,
    });
  } catch (error: any) {
    console.error('GET /achievements error:', error);
    res.status(500).json({
      statusCode: 500,
      error: error.message || 'Error fetching achievements',
    });
  }
});

/**
 * GET /api/achievements/user
 * Obtener logros del usuario actual
 */
router.get('/user', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    const achievements = await AchievementService.getUserAchievements(userId);

    res.status(200).json({
      statusCode: 200,
      data: achievements,
    });
  } catch (error: any) {
    console.error('GET /achievements/user error:', error);
    res.status(500).json({
      statusCode: 500,
      error: error.message || 'Error fetching user achievements',
    });
  }
});

/**
 * GET /api/achievements/streak
 * Obtener streak del usuario
 */
router.get('/streak', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    const streak = await AchievementService.getUserStreak(userId);

    res.status(200).json({
      statusCode: 200,
      data: streak,
    });
  } catch (error: any) {
    console.error('GET /achievements/streak error:', error);
    res.status(500).json({
      statusCode: 500,
      error: error.message || 'Error fetching streak',
    });
  }
});

export default router;
