import { Router } from 'express';
import ReminderSchedulerService from '../services/ReminderSchedulerService';

const router = Router();

/**
 * POST /api/scheduler/reminders/process
 * Ejecutar el procesamiento de recordatorios manualmente
 * 
 * Este endpoint debe ser llamado por:
 * - Un cron job externo (ej: cron-job.org, EasyCron)
 * - Serverless function programada (ej: Vercel Cron, AWS Lambda)
 * - CI/CD pipeline con scheduled workflows
 * 
 * Autenticación recomendada: Header API key o token secreto
 */
router.post('/reminders/process', async (req, res) => {
  try {
    // Verificar autenticación (proteger este endpoint!)
    const authHeader = req.headers['x-scheduler-key'];
    const expectedKey = process.env.SCHEDULER_API_KEY || 'your-secret-scheduler-key';

    if (!authHeader || authHeader !== expectedKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing scheduler API key',
      });
    }

    console.log('📡 Scheduler endpoint triggered');

    // Ejecutar procesamiento de recordatorios
    const result = await ReminderSchedulerService.processReminders();

    return res.status(200).json({
      success: true,
      message: 'Reminders processed successfully',
      data: result,
    });
  } catch (error: unknown) {
    console.error('Error in scheduler endpoint:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Internal server error',
      message,
    });
  }
});

/**
 * GET /api/scheduler/reminders/stats
 * Obtener estadísticas de recordatorios
 */
router.get('/reminders/stats', async (req, res) => {
  try {
    // Verificar autenticación
    const authHeader = req.headers['x-scheduler-key'];
    const expectedKey = process.env.SCHEDULER_API_KEY || 'your-secret-scheduler-key';

    if (!authHeader || authHeader !== expectedKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing scheduler API key',
      });
    }

    const stats = await ReminderSchedulerService.getReminderStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    console.error('Error getting scheduler stats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Internal server error',
      message,
    });
  }
});

/**
 * GET /api/scheduler/health
 * Health check del scheduler (sin autenticación)
 */
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    service: 'reminder-scheduler',
    timestamp: new Date().toISOString(),
  });
});

export default router;
