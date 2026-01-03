import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import ReminderService from '../services/ReminderService';
import NotificationService from '../services/NotificationService';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /api/reminders
 * Obtener recordatorio del usuario actual
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    const reminder = await ReminderService.getReminder(userId);

    res.status(200).json({
      statusCode: 200,
      data: reminder,
    });
  } catch (error: unknown) {
    console.error('GET /reminders error:', error);
    const message = error instanceof Error ? error.message : 'Error fetching reminder';
    res.status(500).json({
      statusCode: 500,
      error: message,
    });
  }
});

/**
 * POST /api/reminders
 * Crear o actualizar recordatorio
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    const { frequency, preferredTime, enabled, customDays } = req.body;

    if (!frequency || !['daily', 'weekly', 'custom'].includes(frequency)) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Invalid frequency. Must be: daily, weekly, or custom',
      });
    }

    const reminder = await ReminderService.createOrUpdateReminder(userId, {
      frequency,
      preferredTime,
      enabled,
      customDays,
    });

    res.status(200).json({
      statusCode: 200,
      data: reminder,
    });
  } catch (error: unknown) {
    console.error('POST /reminders error:', error);
    const message = error instanceof Error ? error.message : 'Error creating/updating reminder';
    res.status(400).json({
      statusCode: 400,
      error: message,
    });
  }
});

/**
 * PUT /api/reminders/:id
 * Actualizar recordatorio específico
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    const { frequency, preferredTime, enabled, customDays } = req.body;

    const reminder = await ReminderService.updateReminder(id, userId, {
      frequency,
      preferredTime,
      enabled,
      customDays,
    });

    res.status(200).json({
      statusCode: 200,
      data: reminder,
    });
  } catch (error: unknown) {
    console.error('PUT /reminders/:id error:', error);
    const message = error instanceof Error ? error.message : 'Error updating reminder';
    res.status(400).json({
      statusCode: 400,
      error: message,
    });
  }
});

/**
 * DELETE /api/reminders/:id
 * Eliminar recordatorio
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    await ReminderService.deleteReminder(id, userId);

    res.status(200).json({
      statusCode: 200,
      message: 'Reminder deleted successfully',
    });
  } catch (error: unknown) {
    console.error('DELETE /reminders/:id error:', error);
    const message = error instanceof Error ? error.message : 'Error deleting reminder';
    res.status(400).json({
      statusCode: 400,
      error: message,
    });
  }
});

/**
 * POST /api/reminders/send-now
 * Enviar email de recordatorio inmediatamente (disparado desde frontend)
 * Este endpoint se llama cuando se muestra la notificación web
 */
router.post('/send-now', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
      });
    }

    // Obtener información del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name, language')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        statusCode: 404,
        error: 'User not found',
      });
    }

    // Obtener el recordatorio activo del usuario
    const { data: reminder, error: reminderError } = await supabase
      .from('study_reminders')
      .select('id')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();

    if (reminderError) {
      console.warn('No active reminder found for user:', userId);
    }

    // Enviar email
    const emailResult = await NotificationService.sendEmailReminder(
      user.email,
      user.full_name || 'Usuario',
      user.language as 'es' | 'en' || 'es'
    );

    if (emailResult.success) {
      // Registrar en logs si hay un recordatorio configurado
      if (reminder?.id) {
        await NotificationService.logReminderSent(
          reminder.id,
          userId,
          'sent',
          emailResult.emailId
        );
      }

      return res.status(200).json({
        statusCode: 200,
        message: 'Email reminder sent successfully',
        emailId: emailResult.emailId,
      });
    } else {
      // Registrar fallo en logs si hay un recordatorio configurado
      if (reminder?.id) {
        await NotificationService.logReminderSent(
          reminder.id,
          userId,
          'failed',
          undefined,
          emailResult.error
        );
      }

      return res.status(500).json({
        statusCode: 500,
        error: 'Failed to send email',
        details: emailResult.error,
      });
    }
  } catch (error: unknown) {
    console.error('POST /reminders/send-now error:', error);
    const message = error instanceof Error ? error.message : 'Error sending reminder';
    res.status(500).json({
      statusCode: 500,
      error: message,
    });
  }
});

export default router;
