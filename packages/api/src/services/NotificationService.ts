import { supabase } from '../config/supabase';
import emailjs from '@emailjs/nodejs';

/**
 * Servicio para enviar notificaciones (email y push)
 */
class NotificationService {
  /**
   * Enviar email de recordatorio usando EmailJS
   */
  async sendEmailReminder(
    email: string,
    userName: string,
    language: 'es' | 'en' = 'es'
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      console.log(`📧 Sending email reminder to: ${email}`);
      console.log(`   User: ${userName}, Language: ${language}`);

      const messages = {
        es: {
          subject: '⏰ ¡Es hora de estudiar para tu certificación ISTQB!',
          greeting: `¡Hola ${userName}!`,
          title: '⏰ Es hora de estudiar',
          message: 'Este es tu recordatorio para continuar con tu preparación para la certificación ISTQB Foundation Level.',
          tip: 'Consejo del día',
          tipText: 'La consistencia es clave. Estudiar 15-30 minutos diarios es más efectivo que sesiones largas ocasionales.',
          cta: 'Comenzar sesión de estudio',
          footer: 'Recibiste este email porque configuraste recordatorios de estudio en ISTQB Study App.',
          unsubscribe: 'Gestionar recordatorios',
          closingMessage: '¡Sigue así! Cada sesión te acerca más a tu certificación.',
        },
        en: {
          subject: '⏰ Time to study for your ISTQB certification!',
          greeting: `Hi ${userName}!`,
          title: '⏰ Time to study',
          message: 'This is your reminder to continue preparing for your ISTQB Foundation Level certification.',
          tip: 'Daily tip',
          tipText: 'Consistency is key. Studying 15-30 minutes daily is more effective than occasional long sessions.',
          cta: 'Start study session',
          footer: 'You received this email because you configured study reminders in ISTQB Study App.',
          unsubscribe: 'Manage reminders',
          closingMessage: 'Keep going! Each session brings you closer to your certification.',
        },
      };

      const message = messages[language];
      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      // Configurar EmailJS
      const serviceId = process.env.EMAILJS_SERVICE_ID || '';
      const templateId = process.env.EMAILJS_TEMPLATE_ID || '';
      const publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
      const privateKey = process.env.EMAILJS_PRIVATE_KEY || '';

      if (!serviceId || !templateId || !publicKey || !privateKey) {
        throw new Error('EmailJS configuration is incomplete. Please check your environment variables.');
      }

      // Enviar con EmailJS (Método para Node.js)
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          user_name: userName,
          language: language,
          app_url: appUrl,
          greeting: message.greeting,
          title: message.title,
          message: message.message,
          tip: message.tip,
          tip_text: message.tipText,
          cta: message.cta,
          footer: message.footer,
          unsubscribe: message.unsubscribe,
          closing_message: message.closingMessage,
          subject: message.subject,
        },
        {
          publicKey: publicKey,
          privateKey: privateKey,
        }
      );

      console.log(`   Subject: ${message.subject}`);
      console.log(`   Status: ✅ Email sent successfully`);
      console.log(`   Response: ${response.status} - ${response.text}`);
      
      return { 
        success: true, 
        emailId: response.text
      };

    } catch (error: unknown) {
      console.error('❌ Error sending email reminder:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * Enviar notificación push
   * TODO: Implementar push notifications con Web Push API
   */
  async sendPushNotification(
    userId: string,
    language: 'es' | 'en' = 'es'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔔 Sending push notification to user: ${userId}`);

      const messages = {
        es: {
          title: '⏰ Hora de estudiar',
          body: '¡No olvides tu sesión de estudio para la certificación ISTQB!',
        },
        en: {
          title: '⏰ Time to study',
          body: "Don't forget your ISTQB certification study session!",
        },
      };

      const message = messages[language];

      // TODO: Implementar Web Push API real
      // Requiere:
      // 1. Guardar push subscriptions del usuario
      // 2. Usar biblioteca como web-push
      // 3. Enviar notificación usando VAPID keys

      console.log(`   Title: ${message.title}`);
      console.log(`   Body: ${message.body}`);
      console.log(`   Status: ✅ Push queued (mock)`);

      return { success: true };

    } catch (error: unknown) {
      console.error('Error sending push notification:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * Registrar log de recordatorio enviado
   */
  async logReminderSent(
    reminderId: string,
    userId: string,
    status: 'sent' | 'failed' | 'bounced',
    emailId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase.from('reminder_logs').insert({
        reminder_id: reminderId,
        user_id: userId,
        sent_at: new Date().toISOString(),
        email_id: emailId,
        status,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Error logging reminder:', error);
    }
  }

  /**
   * Verificar si ya se envió un recordatorio hoy
   */
  async wasReminderSentToday(reminderId: string): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('reminder_logs')
        .select('id')
        .eq('reminder_id', reminderId)
        .eq('status', 'sent')
        .gte('sent_at', today.toISOString())
        .limit(1);

      if (error) throw error;

      return (data?.length ?? 0) > 0;
    } catch (error) {
      console.error('Error checking reminder log:', error);
      return false; // En caso de error, asumir que no se ha enviado
    }
  }
}

export default new NotificationService();
