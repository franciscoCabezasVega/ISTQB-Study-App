import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/index.js';
import { AuthService } from '../services/AuthService.js';

const router = Router();

/**
 * POST /auth/signup
 * Registra un nuevo usuario
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const result = await AuthService.signup(email, password, fullName);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/signin
 * Inicia sesión de usuario
 */
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.signin(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/forgot-password
 * Solicita reset de contraseña
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/reset-password
 * Resetea la contraseña con token de recuperación
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    const { newPassword } = req.body;
    await AuthService.resetPassword(accessToken, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Obtiene el usuario autenticado actual
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await AuthService.getCurrentUser(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /auth/me
 * Actualiza el perfil del usuario autenticado
 */
router.put('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedUser = await AuthService.updateUser(req.user.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export default router;
