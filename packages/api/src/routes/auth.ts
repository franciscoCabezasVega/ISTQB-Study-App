import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import { AuthService } from '../services/AuthService';

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
