import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/index.js';
import { ReportService } from '../services/ReportService.js';
import { UpdateReportPayload } from '@istqb-app/shared';

const router = Router();

/**
 * Middleware para verificar que el usuario es administrador.
 * Compara el email del token con la lista ADMIN_EMAILS del entorno.
 */
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  const userEmail = req.user?.email?.toLowerCase() || '';

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({ statusCode: 403, message: 'Forbidden: admin access required' });
  }

  return next();
};

// ============================================================
// Endpoints de Administración (deben ir ANTES de /:id)
// ============================================================

/**
 * GET /reports/admin/stats
 * Estadísticas de todos los reportes (solo admin)
 */
router.get('/admin/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const stats = await ReportService.getStats();
    return res.status(200).json({ statusCode: 200, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reports/admin/all
 * Lista todos los reportes con filtros (solo admin)
 * Query params: status, type, priority, page, limit
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, type, priority, page, limit } = req.query;
    const result = await ReportService.getAllReports({
      status: status as string | undefined,
      type: type as string | undefined,
      priority: priority as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    return res.status(200).json({
      statusCode: 200,
      data: result.data,
      meta: { total: result.total },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reports/admin/:id
 * Obtiene un reporte por ID (solo admin)
 */
router.get('/admin/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const report = await ReportService.getReportById(req.params.id);
    return res.status(200).json({ statusCode: 200, data: report });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /reports/admin/:id
 * Actualiza estado, prioridad o notas de un reporte (solo admin)
 */
router.put('/admin/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next) => {
  try {
    const payload: UpdateReportPayload = {
      status: req.body.status,
      priority: req.body.priority,
      admin_notes: req.body.admin_notes,
    };
    const report = await ReportService.updateReport(req.params.id, payload);
    return res.status(200).json({ statusCode: 200, data: report });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Endpoints de Usuario
// ============================================================

/**
 * POST /reports
 * Crea un nuevo reporte
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { type, title, description, question_id, page_url } = req.body;

    if (!type || !['question_error', 'system_bug', 'suggestion', 'other'].includes(type)) {
      return res.status(400).json({ statusCode: 400, message: 'Invalid report type' });
    }
    if (!title || title.trim().length < 3 || title.trim().length > 200) {
      return res.status(400).json({ statusCode: 400, message: 'Title must be between 3 and 200 characters' });
    }
    if (!description || description.trim().length < 10 || description.trim().length > 2000) {
      return res.status(400).json({ statusCode: 400, message: 'Description must be between 10 and 2000 characters' });
    }

    const report = await ReportService.createReport(userId, { type, title, description, question_id, page_url });
    return res.status(201).json({ statusCode: 201, data: report });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reports
 * Lista los reportes del usuario autenticado
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const reports = await ReportService.getUserReports(req.user!.id);
    return res.status(200).json({ statusCode: 200, data: reports });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reports/:id
 * Obtiene un reporte propio por ID (debe ir AL FINAL de las rutas GET)
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const report = await ReportService.getUserReportById(req.user!.id, req.params.id);
    return res.status(200).json({ statusCode: 200, data: report });
  } catch (error) {
    next(error);
  }
});

export default router;

