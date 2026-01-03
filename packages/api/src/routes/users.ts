import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import UserService from '../services/UserService';

const router = Router();

/**
 * GET /api/users/profile
 * Obtener perfil del usuario actual
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    const profile = await UserService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({
        statusCode: 404,
        error: 'User profile not found',
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: profile,
    });
  } catch (error: unknown) {
    console.error('GET /users/profile error:', error);
    const message = error instanceof Error ? error.message : 'Error fetching user profile';
    res.status(500).json({
      statusCode: 500,
      error: message,
    });
  }
});

/**
 * PUT /api/users/language
 * Actualizar preferencia de idioma
 */
router.put('/language', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { language } = req.body;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    if (!language || !['es', 'en'].includes(language)) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Invalid language. Must be "es" or "en"',
      });
    }

    const updatedUser = await UserService.updateLanguagePreference(userId, language);

    res.status(200).json({
      statusCode: 200,
      data: updatedUser,
    });
  } catch (error: unknown) {
    console.error('PUT /users/language error:', error);
    const message = error instanceof Error ? error.message : 'Error updating language preference';
    res.status(500).json({
      statusCode: 500,
      error: message,
    });
  }
});

/**
 * PUT /api/users/theme
 * Actualizar preferencia de tema
 */
router.put('/theme', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { theme } = req.body;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Invalid theme. Must be "light" or "dark"',
      });
    }

    const updatedUser = await UserService.updateThemePreference(userId, theme);

    res.status(200).json({
      statusCode: 200,
      data: updatedUser,
    });
  } catch (error: unknown) {
    console.error('PUT /users/theme error:', error);
    const message = error instanceof Error ? error.message : 'Error updating theme preference';
    res.status(500).json({
      statusCode: 500,
      error: message,
    });
  }
});

export default router;
