import { ReminderUtils } from '../services/ReminderUtils';
import { StudyReminder } from '@istqb-app/shared';

describe('ReminderUtils', () => {
  describe('shouldSendToday', () => {
    // Mock reminder base
    const createReminder = (
      frequency: 'daily' | 'weekly' | 'custom',
      customDays?: number[]
    ): StudyReminder => ({
      id: 'test-id',
      user_id: 'test-user',
      frequency,
      preferred_time: '09:00',
      enabled: true,
      custom_days: customDays,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    describe('frequency: daily', () => {
      it('should return true for any day of the week', () => {
        const reminder = createReminder('daily');
        
        // Test todos los días de la semana simulando diferentes fechas
        const testDates = [
          new Date('2026-01-04T12:00:00Z'), // Domingo
          new Date('2026-01-05T12:00:00Z'), // Lunes
          new Date('2026-01-06T12:00:00Z'), // Martes
          new Date('2026-01-07T12:00:00Z'), // Miércoles
          new Date('2026-01-08T12:00:00Z'), // Jueves
          new Date('2026-01-09T12:00:00Z'), // Viernes
          new Date('2026-01-10T12:00:00Z'), // Sábado
        ];

        testDates.forEach(date => {
          // Mockeamos Date para simular diferentes días
          const originalDate = Date;
          global.Date = jest.fn(() => date) as any;
          global.Date.now = originalDate.now;

          expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);

          global.Date = originalDate;
        });
      });
    });

    describe('frequency: weekly', () => {
      it('should return true only on Mondays', () => {
        const reminder = createReminder('weekly');
        
        const monday = new Date('2026-01-05T12:00:00Z'); // Lunes
        const tuesday = new Date('2026-01-06T12:00:00Z'); // Martes

        let originalDate = Date;
        
        // Test lunes
        global.Date = jest.fn(() => monday) as any;
        global.Date.now = originalDate.now;
        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);
        global.Date = originalDate;

        // Test martes
        global.Date = jest.fn(() => tuesday) as any;
        global.Date.now = originalDate.now;
        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);
        global.Date = originalDate;
      });
    });

    describe('frequency: custom - single day', () => {
      it('should return true only on the selected day (Saturday)', () => {
        const reminder = createReminder('custom', [6]); // Solo sábado
        
        const testCases = [
          { date: new Date('2026-01-04T12:00:00Z'), day: 'Domingo', expected: false },
          { date: new Date('2026-01-05T12:00:00Z'), day: 'Lunes', expected: false },
          { date: new Date('2026-01-06T12:00:00Z'), day: 'Martes', expected: false },
          { date: new Date('2026-01-07T12:00:00Z'), day: 'Miércoles', expected: false },
          { date: new Date('2026-01-08T12:00:00Z'), day: 'Jueves', expected: false },
          { date: new Date('2026-01-09T12:00:00Z'), day: 'Viernes', expected: false },
          { date: new Date('2026-01-10T12:00:00Z'), day: 'Sábado', expected: true },
        ];

        testCases.forEach(({ date, day, expected }) => {
          const originalDate = Date;
          global.Date = jest.fn(() => date) as any;
          global.Date.now = originalDate.now;

          const result = ReminderUtils.shouldSendToday(reminder, 'UTC');
          expect(result).toBe(expected);
          
          global.Date = originalDate;
        });
      });

      it('should return true only on the selected day (Wednesday)', () => {
        const reminder = createReminder('custom', [3]); // Solo miércoles
        
        const wednesday = new Date('2026-01-07T12:00:00Z'); // Miércoles
        const thursday = new Date('2026-01-08T12:00:00Z'); // Jueves

        let originalDate = Date;
        
        // Test miércoles
        global.Date = jest.fn(() => wednesday) as any;
        global.Date.now = originalDate.now;
        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);
        global.Date = originalDate;

        // Test jueves
        global.Date = jest.fn(() => thursday) as any;
        global.Date.now = originalDate.now;
        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);
        global.Date = originalDate;
      });

      it('should return true only on the selected day (Sunday)', () => {
        const reminder = createReminder('custom', [0]); // Solo domingo
        
        const sunday = new Date('2026-01-04T12:00:00Z'); // Domingo
        const monday = new Date('2026-01-05T12:00:00Z'); // Lunes

        let originalDate = Date;
        
        // Test domingo
        global.Date = jest.fn(() => sunday) as any;
        global.Date.now = originalDate.now;
        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);
        global.Date = originalDate;

        // Test lunes
        global.Date = jest.fn(() => monday) as any;
        global.Date.now = originalDate.now;
        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);
        global.Date = originalDate;
      });
    });

    describe('frequency: custom - multiple days', () => {
      it('should return true on any of the selected days', () => {
        const reminder = createReminder('custom', [1, 3, 5]); // Lunes, Miércoles, Viernes
        
        const testCases = [
          { date: new Date('2026-01-04T12:00:00Z'), day: 'Domingo', expected: false },
          { date: new Date('2026-01-05T12:00:00Z'), day: 'Lunes', expected: true },
          { date: new Date('2026-01-06T12:00:00Z'), day: 'Martes', expected: false },
          { date: new Date('2026-01-07T12:00:00Z'), day: 'Miércoles', expected: true },
          { date: new Date('2026-01-08T12:00:00Z'), day: 'Jueves', expected: false },
          { date: new Date('2026-01-09T12:00:00Z'), day: 'Viernes', expected: true },
          { date: new Date('2026-01-10T12:00:00Z'), day: 'Sábado', expected: false },
        ];

        testCases.forEach(({ date, day, expected }) => {
          const originalDate = Date;
          global.Date = jest.fn(() => date) as any;
          global.Date.now = originalDate.now;

          const result = ReminderUtils.shouldSendToday(reminder, 'UTC');
          expect(result).toBe(expected);
          
          global.Date = originalDate;
        });
      });

      it('should work with weekend days', () => {
        const reminder = createReminder('custom', [0, 6]); // Domingo y Sábado
        
        const testCases = [
          { date: new Date('2026-01-04T12:00:00Z'), day: 'Domingo', expected: true },
          { date: new Date('2026-01-05T12:00:00Z'), day: 'Lunes', expected: false },
          { date: new Date('2026-01-10T12:00:00Z'), day: 'Sábado', expected: true },
        ];

        testCases.forEach(({ date, day, expected }) => {
          const originalDate = Date;
          global.Date = jest.fn(() => date) as any;
          global.Date.now = originalDate.now;

          const result = ReminderUtils.shouldSendToday(reminder, 'UTC');
          expect(result).toBe(expected);
          
          global.Date = originalDate;
        });
      });
    });

    describe('timezone handling', () => {
      it('should respect user timezone when determining day of week', () => {
        const reminder = createReminder('custom', [6]); // Solo sábado
        
        // Esta fecha es sábado 3 de enero de 2026 a las 23:00 UTC
        // En America/Bogota (UTC-5) sería sábado 3 de enero a las 18:00
        // En Asia/Tokyo (UTC+9) sería domingo 4 de enero a las 08:00
        const date = new Date('2026-01-03T23:00:00Z');

        const originalDate = Date;
        global.Date = jest.fn(() => date) as any;
        global.Date.now = originalDate.now;

        // En Bogotá aún es sábado -> debe enviar
        expect(ReminderUtils.shouldSendToday(reminder, 'America/Bogota')).toBe(true);
        
        // En Tokyo ya es domingo -> no debe enviar
        expect(ReminderUtils.shouldSendToday(reminder, 'Asia/Tokyo')).toBe(false);

        global.Date = originalDate;
      });
    });

    describe('edge cases', () => {
      it('should return false if reminder is disabled', () => {
        const reminder = createReminder('custom', [6]);
        reminder.enabled = false;
        
        const saturday = new Date('2026-01-10T12:00:00Z');
        const originalDate = Date;
        global.Date = jest.fn(() => saturday) as any;
        global.Date.now = originalDate.now;

        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);

        global.Date = originalDate;
      });

      it('should return false if frequency is custom but no days are selected', () => {
        const reminder = createReminder('custom', []);
        
        const saturday = new Date('2026-01-10T12:00:00Z');
        const originalDate = Date;
        global.Date = jest.fn(() => saturday) as any;
        global.Date.now = originalDate.now;

        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);

        global.Date = originalDate;
      });

      it('should return false if frequency is custom but custom_days is undefined', () => {
        const reminder = createReminder('custom');
        
        const saturday = new Date('2026-01-10T12:00:00Z');
        const originalDate = Date;
        global.Date = jest.fn(() => saturday) as any;
        global.Date.now = originalDate.now;

        expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);

        global.Date = originalDate;
      });
    });
  });

  describe('isTimeToSend', () => {
    const createReminder = (preferredTime: string): StudyReminder => ({
      id: 'test-id',
      user_id: 'test-user',
      frequency: 'daily',
      preferred_time: preferredTime,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    it('should return true when current time matches preferred time', () => {
      const reminder = createReminder('09:00');
      
      // 9:00 AM en la zona horaria del usuario
      const currentTime = new Date('2026-01-03T09:00:00Z');
      
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', currentTime)).toBe(true);
    });

    it('should return true within 5-minute window', () => {
      const reminder = createReminder('09:00');
      
      const testCases = [
        { time: new Date('2026-01-03T09:00:00Z'), expected: true },
        { time: new Date('2026-01-03T09:01:00Z'), expected: true },
        { time: new Date('2026-01-03T09:02:00Z'), expected: true },
        { time: new Date('2026-01-03T09:03:00Z'), expected: true },
        { time: new Date('2026-01-03T09:04:00Z'), expected: true },
      ];

      testCases.forEach(({ time, expected }) => {
        expect(ReminderUtils.isTimeToSend(reminder, 'UTC', time)).toBe(expected);
      });
    });

    it('should return false outside the 5-minute window', () => {
      const reminder = createReminder('09:00');
      
      const testCases = [
        { time: new Date('2026-01-03T08:59:00Z'), expected: false },
        { time: new Date('2026-01-03T09:05:00Z'), expected: false },
        { time: new Date('2026-01-03T09:10:00Z'), expected: false },
        { time: new Date('2026-01-03T10:00:00Z'), expected: false },
      ];

      testCases.forEach(({ time, expected }) => {
        expect(ReminderUtils.isTimeToSend(reminder, 'UTC', time)).toBe(expected);
      });
    });

    it('should respect timezone when checking time', () => {
      const reminder = createReminder('21:00'); // 9:00 PM
      
      // 02:00 UTC del día siguiente
      // En Bogotá (UTC-5): 21:00 del día anterior -> debe enviar
      // En UTC: 02:00 -> no debe enviar
      const currentTime = new Date('2026-01-04T02:00:00Z');
      
      expect(ReminderUtils.isTimeToSend(reminder, 'America/Bogota', currentTime)).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', currentTime)).toBe(false);
    });

    it('should handle evening times correctly', () => {
      const reminder = createReminder('21:00');
      
      // 21:00 UTC
      const currentTime = new Date('2026-01-03T21:00:00Z');
      
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', currentTime)).toBe(true);
    });

    it('should handle midnight correctly', () => {
      const reminder = createReminder('00:00');
      
      const currentTime = new Date('2026-01-04T00:00:00Z');
      
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', currentTime)).toBe(true);
    });

    it('should handle late night times correctly', () => {
      const reminder = createReminder('23:30');
      
      const currentTime = new Date('2026-01-03T23:30:00Z');
      
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', currentTime)).toBe(true);
    });
  });

  describe('validateReminderConfig', () => {
    const createReminder = (
      frequency: 'daily' | 'weekly' | 'custom',
      preferredTime: string,
      customDays?: number[]
    ): StudyReminder => ({
      id: 'test-id',
      user_id: 'test-user',
      frequency,
      preferred_time: preferredTime,
      enabled: true,
      custom_days: customDays,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    it('should validate daily frequency', () => {
      const reminder = createReminder('daily', '09:00');
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate weekly frequency', () => {
      const reminder = createReminder('weekly', '09:00');
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate custom frequency with days', () => {
      const reminder = createReminder('custom', '09:00', [1, 3, 5]);
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate custom frequency with single day', () => {
      const reminder = createReminder('custom', '21:00', [6]);
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for custom frequency without days', () => {
      const reminder = createReminder('custom', '09:00', []);
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Custom frequency requires at least one day selected');
    });

    it('should fail validation for invalid day numbers', () => {
      const reminder = createReminder('custom', '09:00', [1, 7, 8]); // 7 y 8 son inválidos
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid days'))).toBe(true);
    });

    it('should fail validation for invalid time format', () => {
      const reminder = createReminder('daily', '25:00'); // Hora inválida
      const result = ReminderUtils.validateReminderConfig(reminder);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid time format (expected HH:MM in 24h format)');
    });

    it('should validate all valid time formats', () => {
      const times = ['00:00', '09:00', '12:30', '21:00', '23:59'];
      
      times.forEach(time => {
        const reminder = createReminder('daily', time);
        const result = ReminderUtils.validateReminderConfig(reminder);
        
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('formatCustomDays', () => {
    it('should format single day in Spanish', () => {
      expect(ReminderUtils.formatCustomDays([6], 'es')).toBe('Sábado');
      expect(ReminderUtils.formatCustomDays([0], 'es')).toBe('Domingo');
      expect(ReminderUtils.formatCustomDays([3], 'es')).toBe('Miércoles');
    });

    it('should format single day in English', () => {
      expect(ReminderUtils.formatCustomDays([6], 'en')).toBe('Saturday');
      expect(ReminderUtils.formatCustomDays([0], 'en')).toBe('Sunday');
      expect(ReminderUtils.formatCustomDays([3], 'en')).toBe('Wednesday');
    });

    it('should format two days in Spanish', () => {
      expect(ReminderUtils.formatCustomDays([1, 5], 'es')).toBe('Lunes y Viernes');
      expect(ReminderUtils.formatCustomDays([0, 6], 'es')).toBe('Domingo y Sábado');
    });

    it('should format two days in English', () => {
      expect(ReminderUtils.formatCustomDays([1, 5], 'en')).toBe('Monday and Friday');
      expect(ReminderUtils.formatCustomDays([0, 6], 'en')).toBe('Sunday and Saturday');
    });

    it('should format multiple days in Spanish', () => {
      expect(ReminderUtils.formatCustomDays([1, 3, 5], 'es')).toBe('Lunes, Miércoles y Viernes');
    });

    it('should format multiple days in English', () => {
      expect(ReminderUtils.formatCustomDays([1, 3, 5], 'en')).toBe('Monday, Wednesday and Friday');
    });

    it('should handle empty array', () => {
      expect(ReminderUtils.formatCustomDays([], 'es')).toBe('Ningún día seleccionado');
      expect(ReminderUtils.formatCustomDays([], 'en')).toBe('No days selected');
    });

    it('should sort days before formatting', () => {
      expect(ReminderUtils.formatCustomDays([5, 1, 3], 'es')).toBe('Lunes, Miércoles y Viernes');
    });
  });
});
