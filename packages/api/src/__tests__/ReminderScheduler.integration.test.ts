import { ReminderUtils } from '../services/ReminderUtils';
import { StudyReminder } from '@istqb-app/shared';

/**
 * Test de integración para verificar el comportamiento del scheduler
 * en diferentes escenarios de configuración
 */
describe('ReminderScheduler Integration Tests', () => {
  describe('Real-world scenario: Single day reminder on Saturday', () => {
    it('should send reminder on Saturday at 21:00 Colombia time', () => {
      // Configuración real del usuario
      const reminder: StudyReminder = {
        id: '9637196c-b080-4c15-bf81-b6128997158b',
        user_id: '72818092-44db-455f-8472-2c522b03f068',
        frequency: 'custom',
        preferred_time: '21:00',
        enabled: true,
        custom_days: [6], // Solo sábado
        created_at: '2025-12-27T23:42:46.665Z',
        updated_at: '2025-12-28T02:33:27.913Z',
      };

      const userTimezone = 'America/Bogota'; // UTC-5

      // Sábado 3 de enero de 2026, 21:00 en Colombia = 02:00 del 4 de enero en UTC
      const saturdayAt9PM = new Date('2026-01-04T02:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => saturdayAt9PM) as any;
      global.Date.now = originalDate.now;

      // Verificar que debe enviarse hoy (es sábado)
      expect(ReminderUtils.shouldSendToday(reminder, userTimezone)).toBe(true);

      global.Date = originalDate;

      // Verificar que es la hora correcta (pasando currentTime explícitamente)
      expect(ReminderUtils.isTimeToSend(reminder, userTimezone, saturdayAt9PM)).toBe(true);
    });

    it('should NOT send reminder on Friday (day before)', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '21:00',
        enabled: true,
        custom_days: [6], // Solo sábado
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const userTimezone = 'America/Bogota';

      // Viernes 2 de enero de 2026, 21:00 en Colombia
      const fridayAt9PM = new Date('2026-01-03T02:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => fridayAt9PM) as any;
      global.Date.now = originalDate.now;

      // No debe enviar porque es viernes, no sábado
      expect(ReminderUtils.shouldSendToday(reminder, userTimezone)).toBe(false);

      global.Date = originalDate;
    });

    it('should NOT send reminder on Sunday (day after)', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '21:00',
        enabled: true,
        custom_days: [6], // Solo sábado
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const userTimezone = 'America/Bogota';

      // Domingo 4 de enero de 2026, 21:00 en Colombia
      const sundayAt9PM = new Date('2026-01-05T02:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => sundayAt9PM) as any;
      global.Date.now = originalDate.now;

      // No debe enviar porque es domingo, no sábado
      expect(ReminderUtils.shouldSendToday(reminder, userTimezone)).toBe(false);

      global.Date = originalDate;
    });

    it('should NOT send reminder on Saturday at 23:00 (past the window)', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '21:00',
        enabled: true,
        custom_days: [6], // Solo sábado
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const userTimezone = 'America/Bogota';

      // Sábado 3 de enero de 2026, 23:00 en Colombia (ya pasó la ventana de 21:00-21:05)
      const saturdayAt11PM = new Date('2026-01-04T04:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => saturdayAt11PM) as any;
      global.Date.now = originalDate.now;

      // Sí es sábado, pero...
      expect(ReminderUtils.shouldSendToday(reminder, userTimezone)).toBe(true);
      
      global.Date = originalDate;

      // ...ya pasó la hora de envío
      expect(ReminderUtils.isTimeToSend(reminder, userTimezone, saturdayAt11PM)).toBe(false);
    });
  });

  describe('Multiple day scenarios', () => {
    it('should send on Mondays when configured', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '09:00',
        enabled: true,
        custom_days: [1, 3, 5], // Lunes, Miércoles, Viernes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Lunes 5 de enero de 2026 a las 09:00 UTC
      const mondayMorning = new Date('2026-01-05T09:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => mondayMorning) as any;
      global.Date.now = originalDate.now;

      // Debe enviar el lunes
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);
      
      global.Date = originalDate;
    });

    it('should send on Wednesdays when configured', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '09:00',
        enabled: true,
        custom_days: [1, 3, 5], // Lunes, Miércoles, Viernes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Miércoles 7 de enero de 2026 a las 09:00 UTC
      const wednesdayMorning = new Date('2026-01-07T09:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => wednesdayMorning) as any;
      global.Date.now = originalDate.now;

      // Debe enviar el miércoles
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);
      
      global.Date = originalDate;
    });

    it('should send on Fridays when configured', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '09:00',
        enabled: true,
        custom_days: [1, 3, 5], // Lunes, Miércoles, Viernes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Viernes 9 de enero de 2026 a las 09:00 UTC
      const fridayMorning = new Date('2026-01-09T09:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => fridayMorning) as any;
      global.Date.now = originalDate.now;

      // Debe enviar el viernes
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(true);
      
      global.Date = originalDate;
    });

    it('should NOT send on Tuesdays when only Mon/Wed/Fri configured', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '09:00',
        enabled: true,
        custom_days: [1, 3, 5], // Lunes, Miércoles, Viernes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Martes 6 de enero de 2026 a las 09:00 UTC
      const tuesdayMorning = new Date('2026-01-06T09:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => tuesdayMorning) as any;
      global.Date.now = originalDate.now;

      // NO debe enviar el martes
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);
      
      global.Date = originalDate;
    });
  });

  describe('Edge case: Timezone transitions', () => {
    it('should handle day changes correctly across timezones', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '23:00',
        enabled: true,
        custom_days: [5], // Solo viernes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Viernes 9 de enero de 2026, 23:00 en NYC (UTC-5)
      // = Sábado 10 de enero, 04:00 en UTC
      const fridayNightNYC = new Date('2026-01-10T04:00:00Z');

      let originalDate = Date;
      global.Date = jest.fn(() => fridayNightNYC) as any;
      global.Date.now = originalDate.now;

      // En NYC aún es viernes -> debe enviar
      expect(ReminderUtils.shouldSendToday(reminder, 'America/New_York')).toBe(true);
      
      global.Date = originalDate;

      // isTimeToSend con tiempo explícito
      expect(ReminderUtils.isTimeToSend(reminder, 'America/New_York', fridayNightNYC)).toBe(true);

      // Mock Date para verificar UTC
      originalDate = Date;
      global.Date = jest.fn(() => fridayNightNYC) as any;
      global.Date.now = originalDate.now;

      // En UTC ya es sábado -> NO debe enviar
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC')).toBe(false);

      global.Date = originalDate;
    });

    it('should handle midnight correctly', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '00:00',
        enabled: true,
        custom_days: [6], // Solo sábado
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Sábado 3 de enero de 2026, 00:00 en Colombia
      // = Sábado 3 de enero, 05:00 en UTC
      const saturdayMidnight = new Date('2026-01-03T05:00:00Z');

      const originalDate = Date;
      global.Date = jest.fn(() => saturdayMidnight) as any;
      global.Date.now = originalDate.now;

      expect(ReminderUtils.shouldSendToday(reminder, 'America/Bogota')).toBe(true);
      
      global.Date = originalDate;

      expect(ReminderUtils.isTimeToSend(reminder, 'America/Bogota', saturdayMidnight)).toBe(true);
    });
  });

  describe('Scheduler timing window', () => {
    it('should send within the 5-minute window', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '21:00',
        enabled: true,
        custom_days: [6],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const timezone = 'America/Bogota';

      // Sábado 3 de enero de 2026 en Colombia (UTC-5)
      const times = [
        { time: new Date('2026-01-04T02:00:00Z'), minutes: '21:00', expected: true },  // 21:00 Colombia
        { time: new Date('2026-01-04T02:01:00Z'), minutes: '21:01', expected: true },  // 21:01 Colombia
        { time: new Date('2026-01-04T02:02:00Z'), minutes: '21:02', expected: true },  // 21:02 Colombia
        { time: new Date('2026-01-04T02:03:00Z'), minutes: '21:03', expected: true },  // 21:03 Colombia
        { time: new Date('2026-01-04T02:04:00Z'), minutes: '21:04', expected: true },  // 21:04 Colombia
        { time: new Date('2026-01-04T02:05:00Z'), minutes: '21:05', expected: false }, // 21:05 Colombia (fuera de ventana)
        { time: new Date('2026-01-04T02:06:00Z'), minutes: '21:06', expected: false }, // 21:06 Colombia
      ];

      times.forEach(({ time, expected }) => {
        const result = ReminderUtils.isTimeToSend(reminder, timezone, time);
        expect(result).toBe(expected);
      });
    });

    it('should NOT send before the window starts', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '21:00',
        enabled: true,
        custom_days: [6],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const timezone = 'America/Bogota';

      // 20:59 en Colombia (1 minuto antes)
      const beforeWindow = new Date('2026-01-04T01:59:00Z');

      expect(ReminderUtils.isTimeToSend(reminder, timezone, beforeWindow)).toBe(false);
    });
  });

  describe('Configuration validation', () => {
    it('should reject invalid configurations', () => {
      const invalidReminders = [
        {
          reminder: {
            id: 'test-id',
            user_id: 'test-user',
            frequency: 'custom' as const,
            preferred_time: '21:00',
            enabled: true,
            custom_days: [], // Sin días seleccionados
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: 'Custom frequency requires at least one day selected',
        },
        {
          reminder: {
            id: 'test-id',
            user_id: 'test-user',
            frequency: 'custom' as const,
            preferred_time: '25:00', // Hora inválida
            enabled: true,
            custom_days: [6],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: 'Invalid time format',
        },
        {
          reminder: {
            id: 'test-id',
            user_id: 'test-user',
            frequency: 'custom' as const,
            preferred_time: '21:00',
            enabled: true,
            custom_days: [7, 8], // Días inválidos
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: 'Invalid days',
        },
      ];

      invalidReminders.forEach(({ reminder, error }) => {
        const validation = ReminderUtils.validateReminderConfig(reminder);
        expect(validation.valid).toBe(false);
        expect(validation.errors.some(e => e.includes(error))).toBe(true);
      });
    });

    it('should accept valid configurations with single day', () => {
      const validReminders = [
        { custom_days: [0] }, // Domingo
        { custom_days: [1] }, // Lunes
        { custom_days: [2] }, // Martes
        { custom_days: [3] }, // Miércoles
        { custom_days: [4] }, // Jueves
        { custom_days: [5] }, // Viernes
        { custom_days: [6] }, // Sábado
      ];

      validReminders.forEach(({ custom_days }) => {
        const reminder: StudyReminder = {
          id: 'test-id',
          user_id: 'test-user',
          frequency: 'custom',
          preferred_time: '09:00',
          enabled: true,
          custom_days,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const validation = ReminderUtils.validateReminderConfig(reminder);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });
  });
});
