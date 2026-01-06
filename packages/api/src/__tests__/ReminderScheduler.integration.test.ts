import { ReminderUtils } from '../services/ReminderUtils';
import { StudyReminder } from '@istqb-app/shared';

/**
 * Test de integración para verificar el comportamiento del scheduler
 * Los tests usan UTC para evitar inconsistencias en CI
 */
describe('ReminderScheduler Integration Tests', () => {
  describe('Basic reminder scheduling', () => {
    it('should send daily reminders every day', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'daily',
        preferred_time: '09:00',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const testDate = new Date('2026-01-03T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', testDate)).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', testDate)).toBe(true);
    });

    it('should send weekly reminders on Mondays', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'weekly',
        preferred_time: '09:00',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Lunes 5 de enero de 2026
      const monday = new Date('2026-01-05T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', monday)).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', monday)).toBe(true);

      // Martes 6 de enero de 2026
      const tuesday = new Date('2026-01-06T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', tuesday)).toBe(false);
    });

    it('should send custom reminders on specified days', () => {
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

      // Lunes
      const monday = new Date('2026-01-05T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', monday)).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', monday)).toBe(true);

      // Martes (no configurado)
      const tuesday = new Date('2026-01-06T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', tuesday)).toBe(false);

      // Miércoles
      const wednesday = new Date('2026-01-07T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', wednesday)).toBe(true);
    });
  });

  describe('Timing window validation', () => {
    it('should send within the 5-minute window', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'daily',
        preferred_time: '09:00',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Dentro de la ventana (09:00-09:04)
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', new Date('2026-01-03T09:00:00Z'))).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', new Date('2026-01-03T09:01:00Z'))).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', new Date('2026-01-03T09:04:00Z'))).toBe(true);
      
      // Fuera de la ventana
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', new Date('2026-01-03T08:59:00Z'))).toBe(false);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', new Date('2026-01-03T09:05:00Z'))).toBe(false);
    });

    it('should NOT send before the window starts', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'daily',
        preferred_time: '09:00',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const beforeWindow = new Date('2026-01-03T08:59:00Z');
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', beforeWindow)).toBe(false);
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

    it('should accept valid configurations with Saturday', () => {
      const reminder: StudyReminder = {
        id: 'test-id',
        user_id: 'test-user',
        frequency: 'custom',
        preferred_time: '09:00',
        enabled: true,
        custom_days: [6], // Solo sábado
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Sábado 10 de enero de 2026
      const saturday = new Date('2026-01-10T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', saturday)).toBe(true);
      expect(ReminderUtils.isTimeToSend(reminder, 'UTC', saturday)).toBe(true);

      // Domingo 11 de enero de 2026
      const sunday = new Date('2026-01-11T09:00:00Z');
      expect(ReminderUtils.shouldSendToday(reminder, 'UTC', sunday)).toBe(false);
    });
  });
});
