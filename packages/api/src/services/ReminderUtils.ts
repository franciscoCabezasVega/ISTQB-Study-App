import { StudyReminder } from '@istqb-app/shared';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Utilidades para filtrado y validación de recordatorios
 */
export class ReminderUtils {
  /**
   * Verificar si un recordatorio debe enviarse HOY según su configuración
   */
  static shouldSendToday(
    reminder: StudyReminder,
    userTimezone: string = 'UTC',
    currentTime?: Date
  ): boolean {
    if (!reminder.enabled) {
      return false;
    }

    // Obtener el día actual en la zona horaria del usuario
    const now = currentTime || new Date();
    
    // Usar formatInTimeZone de date-fns-tz que funciona correctamente con zonas horarias en cualquier ambiente
    // 'i' devuelve el día ISO (1=lunes, 2=martes, ..., 7=domingo)
    // Convertir a formato JS getDay (0=domingo, 1=lunes, ..., 6=sábado)
    const isoDayOfWeek = parseInt(formatInTimeZone(now, userTimezone, 'i'), 10);
    const currentDayOfWeek = isoDayOfWeek % 7; // 7 (domingo ISO) → 0 (domingo JS), 1-6 permanecen igual

    switch (reminder.frequency) {
      case 'daily':
        // Enviar todos los días
        return true;

      case 'weekly':
        // Enviar solo los lunes (día 1)
        // Puedes personalizar esto según tus necesidades
        return currentDayOfWeek === 1;

      case 'custom':
        // Enviar solo en los días especificados por el usuario
        if (!reminder.custom_days || reminder.custom_days.length === 0) {
          console.warn(`Reminder ${reminder.id} has frequency 'custom' but no custom_days set`);
          return false;
        }
        return reminder.custom_days.includes(currentDayOfWeek);

      default:
        return false;
    }
  }

  /**
   * Verificar si ya es hora de enviar el recordatorio según la hora preferida
   * Este método verifica TANTO que sea el día correcto COMO que sea la hora correcta
   */
  static isTimeToSend(
    reminder: StudyReminder,
    userTimezone: string = 'UTC',
    currentTime?: Date
  ): boolean {
    const now = currentTime || new Date();
    
    // Debug logging para CI
    if (process.env.CI) {
      console.log('[isTimeToSend] now:', now.toISOString());
      console.log('[isTimeToSend] userTimezone:', userTimezone);
      console.log('[isTimeToSend] reminder.frequency:', reminder.frequency);
      console.log('[isTimeToSend] reminder.custom_days:', reminder.custom_days);
    }
    
    // Primero verificar si debe enviarse HOY según frecuencia/días personalizados
    const shouldSend = this.shouldSendToday(reminder, userTimezone, now);
    if (process.env.CI) {
      console.log('[isTimeToSend] shouldSendToday returned:', shouldSend);
    }
    if (!shouldSend) {
      return false;
    }
    
    // Obtener hora actual en zona horaria del usuario usando formatInTimeZone de date-fns-tz
    const currentHour = parseInt(formatInTimeZone(now, userTimezone, 'H'), 10); // 0-23
    const currentMinute = parseInt(formatInTimeZone(now, userTimezone, 'm'), 10); // 0-59
    
    if (process.env.CI) {
      console.log('[isTimeToSend] currentHour:', currentHour, 'currentMinute:', currentMinute);
    }

    // Parsear hora preferida (formato HH:MM)
    const [preferredHour, preferredMinute] = (reminder.preferred_time || '09:00')
      .split(':')
      .map(Number);

    // Verificar si estamos en la hora exacta o dentro de una ventana de 5 minutos
    // Esto ayuda a evitar perder recordatorios si el scheduler se ejecuta cada X minutos
    const isExactHour = currentHour === preferredHour;
    const isWithinWindow = currentMinute >= preferredMinute && currentMinute < preferredMinute + 5;

    return isExactHour && isWithinWindow;
  }

  /**
   * Obtener el próximo día en que se debe enviar un recordatorio
   */
  static getNextSendDate(reminder: StudyReminder, userTimezone: string = 'UTC'): Date | null {
    if (!reminder.enabled) {
      return null;
    }

    const now = new Date();
    // Usar formatInTimeZone para obtener el día de la semana en la zona horaria del usuario
    const isoDayOfWeek = parseInt(formatInTimeZone(now, userTimezone, 'i'), 10);
    const currentDayOfWeek = isoDayOfWeek % 7; // Convertir de ISO a formato JS

    let daysUntilNext = 0;

    switch (reminder.frequency) {
      case 'daily':
        daysUntilNext = 1;
        break;

      case 'weekly':
        // Próximo lunes
        daysUntilNext = (8 - currentDayOfWeek) % 7 || 7;
        break;

      case 'custom': {
        if (!reminder.custom_days || reminder.custom_days.length === 0) {
          return null;
        }

        // Encontrar el próximo día en custom_days
        const sortedDays = [...reminder.custom_days].sort((a, b) => a - b);
        
        // Buscar el próximo día en la misma semana
        const nextDayThisWeek = sortedDays.find(day => day > currentDayOfWeek);
        
        if (nextDayThisWeek !== undefined) {
          daysUntilNext = nextDayThisWeek - currentDayOfWeek;
        } else {
          // Si no hay días restantes esta semana, tomar el primer día de la próxima semana
          daysUntilNext = (7 - currentDayOfWeek) + sortedDays[0];
        }
        break;
      }

      default:
        return null;
    }

    // Calcular fecha y hora del próximo envío
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysUntilNext);

    // Establecer la hora preferida
    const [hour, minute] = (reminder.preferred_time || '09:00').split(':').map(Number);
    nextDate.setHours(hour, minute, 0, 0);

    return nextDate;
  }

  /**
   * Formatear días personalizados para mostrar
   */
  static formatCustomDays(customDays: number[], language: 'es' | 'en' = 'es'): string {
    const dayNames = {
      es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    };

    if (!customDays || customDays.length === 0) {
      return language === 'es' ? 'Ningún día seleccionado' : 'No days selected';
    }

    const sortedDays = [...customDays].sort((a, b) => a - b);
    const names = sortedDays.map(day => dayNames[language][day]);

    if (names.length === 1) {
      return names[0];
    }

    if (names.length === 2) {
      return names.join(language === 'es' ? ' y ' : ' and ');
    }

    const last = names.pop();
    return names.join(', ') + (language === 'es' ? ' y ' : ' and ') + last;
  }

  /**
   * Validar configuración de recordatorio
   */
  static validateReminderConfig(reminder: StudyReminder): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!reminder.frequency) {
      errors.push('Frequency is required');
    }

    if (!['daily', 'weekly', 'custom'].includes(reminder.frequency)) {
      errors.push('Invalid frequency');
    }

    if (reminder.frequency === 'custom') {
      if (!reminder.custom_days || reminder.custom_days.length === 0) {
        errors.push('Custom frequency requires at least one day selected');
      }

      if (reminder.custom_days) {
        const invalidDays = reminder.custom_days.filter((day: number) => day < 0 || day > 6);
        if (invalidDays.length > 0) {
          errors.push(`Invalid days: ${invalidDays.join(', ')} (must be 0-6)`);
        }
      }
    }

    // Validar formato de hora (HH:MM)
    if (reminder.preferred_time) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(reminder.preferred_time)) {
        errors.push('Invalid time format (expected HH:MM in 24h format)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
