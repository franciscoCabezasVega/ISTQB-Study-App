import ReminderService from './ReminderService.js';
import NotificationService from './NotificationService.js';
import { ReminderUtils } from './ReminderUtils.js';
import { supabase } from '../config/supabase.js';
import { StudyReminder } from '@istqb-app/shared';

// Tipo para el resultado del JOIN de Supabase
interface ReminderWithUser extends StudyReminder {
  users?: {
    id: string;
    email: string;
    full_name: string | null;
    language: string;
    timezone: string;
  } | {
    id: string;
    email: string;
    full_name: string | null;
    language: string;
    timezone: string;
  }[];
}

/**
 * Servicio para programar y ejecutar el envío de recordatorios
 */
class ReminderSchedulerService {
  private isRunning = false;

  /**
   * Procesar y enviar todos los recordatorios que correspondan
   * Este método debe ser llamado por un cron job o scheduler externo
   */
  async processReminders(): Promise<{
    processed: number;
    sent: number;
    skipped: number;
    failed: number;
    errors: string[];
  }> {
    // Prevenir ejecuciones concurrentes
    if (this.isRunning) {
      console.log('⚠️ Scheduler already running, skipping this execution');
      return { processed: 0, sent: 0, skipped: 0, failed: 0, errors: [] };
    }

    this.isRunning = true;
    console.log('🚀 Starting reminder scheduler...');

    const stats = {
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      // 1. Obtener todos los recordatorios activos CON información de usuarios (JOIN optimizado)
      // Esto reduce de 2 queries a 1 sola query, ahorrando ~50% de requests a Supabase
      const { data: remindersWithUsers, error: queryError } = await supabase
        .from('study_reminders')
        .select(`
          *,
          users!inner(id, email, full_name, language, timezone)
        `)
        .eq('enabled', true);

      if (queryError) {
        throw new Error(`Error fetching reminders: ${queryError.message}`);
      }

      const reminders = (remindersWithUsers || []) as ReminderWithUser[];
      console.log(`📋 Found ${reminders.length} active reminders`);

      // 2. Procesar cada recordatorio
      for (const reminderData of reminders) {
        // Extraer datos del recordatorio y usuario del JOIN
        const { users: userData, ...reminderProps } = reminderData;
        const reminder = reminderProps as StudyReminder;
        const user = Array.isArray(userData) ? userData[0] : userData;
        stats.processed++;

        try {
          if (!user) {
            console.warn(`⚠️ User ${reminder.user_id} not found, skipping reminder ${reminder.id}`);
            stats.skipped++;
            continue;
          }

          const userTimezone = user.timezone || 'UTC';
          const userLanguage = user.language || 'es';

          // 4. Validar configuración del recordatorio
          const validation = ReminderUtils.validateReminderConfig(reminder);
          if (!validation.valid) {
            console.warn(`⚠️ Invalid reminder config for ${reminder.id}:`, validation.errors);
            stats.skipped++;
            stats.errors.push(`Reminder ${reminder.id}: ${validation.errors.join(', ')}`);
            continue;
          }

          // 5. Verificar si debe enviarse hoy según frequency y custom_days
          if (!ReminderUtils.shouldSendToday(reminder, userTimezone)) {
            console.log(`⏭️ Skipping reminder ${reminder.id} - not scheduled for today`);
            stats.skipped++;
            continue;
          }

          // 6. Verificar si es la hora correcta
          if (!ReminderUtils.isTimeToSend(reminder, userTimezone)) {
            console.log(`⏰ Skipping reminder ${reminder.id} - not the right time yet`);
            stats.skipped++;
            continue;
          }

          // 7. Verificar si ya se envió hoy (evitar duplicados)
          const alreadySent = await NotificationService.wasReminderSentToday(reminder.id);
          if (alreadySent) {
            console.log(`✅ Reminder ${reminder.id} already sent today, skipping`);
            stats.skipped++;
            continue;
          }

          // 8. Enviar recordatorio
          console.log(`📤 Sending reminder ${reminder.id} to ${user.email} (${userTimezone})`);
          
          const emailResult = await NotificationService.sendEmailReminder(
            user.email,
            user.full_name || 'Usuario',
            userLanguage as 'es' | 'en'
          );

          if (emailResult.success) {
            // Registrar envío exitoso
            await NotificationService.logReminderSent(
              reminder.id,
              user.id,
              'sent',
              emailResult.emailId
            );

            // Intentar enviar push notification también
            await NotificationService.sendPushNotification(user.id, userLanguage as 'es' | 'en');

            stats.sent++;
            console.log(`✅ Reminder ${reminder.id} sent successfully`);
          } else {
            // Registrar fallo
            await NotificationService.logReminderSent(
              reminder.id,
              user.id,
              'failed',
              undefined,
              emailResult.error
            );

            stats.failed++;
            stats.errors.push(`Reminder ${reminder.id}: ${emailResult.error}`);
            console.error(`❌ Failed to send reminder ${reminder.id}:`, emailResult.error);
          }

        } catch (error: unknown) {
          stats.failed++;
          const errorMsg = `Error processing reminder ${reminder.id}: ${(error as Error).message}`;
          stats.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Resumen final
      console.log('\n📊 Scheduler Summary:');
      console.log(`   Total processed: ${stats.processed}`);
      console.log(`   Successfully sent: ${stats.sent}`);
      console.log(`   Skipped: ${stats.skipped}`);
      console.log(`   Failed: ${stats.failed}`);
      
      if (stats.errors.length > 0) {
        console.log('\n⚠️ Errors:');
        stats.errors.forEach(err => console.log(`   - ${err}`));
      }

    } catch (error: unknown) {
      console.error('💥 Fatal error in reminder scheduler:', error);
      stats.errors.push(`Fatal error: ${(error as Error).message}`);
    } finally {
      this.isRunning = false;
      console.log('✅ Scheduler finished\n');
    }

    return stats;
  }

  /**
   * Obtener estadísticas de recordatorios por procesar
   */
  async getReminderStats(): Promise<{
    totalActive: number;
    byFrequency: { daily: number; weekly: number; custom: number };
    nextBatch: number;
  }> {
    try {
      const reminders = await ReminderService.getActiveRemindersToSend();
      
      const byFrequency = {
        daily: reminders.filter(r => r.frequency === 'daily').length,
        weekly: reminders.filter(r => r.frequency === 'weekly').length,
        custom: reminders.filter(r => r.frequency === 'custom').length,
      };

      // Contar cuántos se enviarían ahora (aproximado)
      let nextBatch = 0;
      for (const reminder of reminders) {
        // Obtener timezone del usuario
        const { data: user } = await supabase
          .from('users')
          .select('timezone')
          .eq('id', reminder.user_id)
          .single();

        const userTimezone = user?.timezone || 'UTC';
        
        if (
          ReminderUtils.shouldSendToday(reminder, userTimezone) &&
          ReminderUtils.isTimeToSend(reminder, userTimezone)
        ) {
          nextBatch++;
        }
      }

      return {
        totalActive: reminders.length,
        byFrequency,
        nextBatch,
      };
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      throw error;
    }
  }
}

export default new ReminderSchedulerService();
