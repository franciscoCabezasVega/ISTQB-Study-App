import { supabase } from '../config/supabase';
import { StudyReminder } from '@istqb-app/shared';
import { v4 as uuidv4 } from 'uuid';

export interface CreateReminderRequest {
  frequency: 'daily' | 'weekly' | 'custom';
  preferredTime?: string; // HH:MM format
  enabled?: boolean;
  customDays?: number[]; // Array de días (0=Domingo, 1=Lunes, ..., 6=Sábado) para frequency='custom'
}

export interface UpdateReminderRequest {
  frequency?: 'daily' | 'weekly' | 'custom';
  preferredTime?: string;
  enabled?: boolean;
  customDays?: number[];
}

class ReminderService {
  /**
   * Crear o actualizar recordatorio de estudio para un usuario
   */
  async createOrUpdateReminder(
    userId: string,
    reminderData: CreateReminderRequest
  ): Promise<StudyReminder> {
    try {
      // Verificar si ya existe un recordatorio para este usuario
      const { data: existing } = await supabase
        .from('study_reminders')
        .select('*')
        .eq('user_id', userId)
        .single();

      const now = new Date().toISOString();

      if (existing) {
        // Actualizar recordatorio existente
        const { data, error } = await supabase
          .from('study_reminders')
          .update({
            frequency: reminderData.frequency,
            preferred_time: reminderData.preferredTime || existing.preferred_time,
            enabled: reminderData.enabled !== undefined ? reminderData.enabled : existing.enabled,
            custom_days: reminderData.customDays || existing.custom_days,
            updated_at: now,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Error updating reminder: ${error.message}`);
        }

        return this.mapToStudyReminder(data);
      } else {
        // Crear nuevo recordatorio
        const reminderId = uuidv4();
        const { data, error } = await supabase
          .from('study_reminders')
          .insert({
            id: reminderId,
            user_id: userId,
            frequency: reminderData.frequency,
            preferred_time: reminderData.preferredTime || '09:00',
            enabled: reminderData.enabled !== undefined ? reminderData.enabled : true,
            custom_days: reminderData.customDays || null,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Error creating reminder: ${error.message}`);
        }

        return this.mapToStudyReminder(data);
      }
    } catch (error) {
      console.error('ReminderService.createOrUpdateReminder error:', error);
      throw error;
    }
  }

  /**
   * Obtener recordatorio de un usuario
   */
  async getReminder(userId: string): Promise<StudyReminder | null> {
    try {
      const { data, error } = await supabase
        .from('study_reminders')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found
          return null;
        }
        throw new Error(`Error fetching reminder: ${error.message}`);
      }

      return this.mapToStudyReminder(data);
    } catch (error) {
      console.error('ReminderService.getReminder error:', error);
      throw error;
    }
  }

  /**
   * Actualizar recordatorio existente
   */
  async updateReminder(
    reminderId: string,
    userId: string,
    updateData: UpdateReminderRequest
  ): Promise<StudyReminder> {
    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.frequency) updates.frequency = updateData.frequency;
      if (updateData.preferredTime) updates.preferred_time = updateData.preferredTime;
      if (updateData.enabled !== undefined) updates.enabled = updateData.enabled;
      if (updateData.customDays !== undefined) updates.custom_days = updateData.customDays;

      const { data, error } = await supabase
        .from('study_reminders')
        .update(updates)
        .eq('id', reminderId)
        .eq('user_id', userId) // Asegurar que el usuario es el propietario
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating reminder: ${error.message}`);
      }

      return this.mapToStudyReminder(data);
    } catch (error) {
      console.error('ReminderService.updateReminder error:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los recordatorios activos que deben enviarse
   * (Para uso en scheduler/cron job)
   */
  async getActiveRemindersToSend(): Promise<StudyReminder[]> {
    try {
      const { data, error } = await supabase
        .from('study_reminders')
        .select('*')
        .eq('enabled', true);

      if (error) {
        throw new Error(`Error fetching active reminders: ${error.message}`);
      }

      return data.map((r: any) => this.mapToStudyReminder(r));
    } catch (error) {
      console.error('ReminderService.getActiveRemindersToSend error:', error);
      throw error;
    }
  }

  /**
   * Deshabilitar recordatorio
   */
  async disableReminder(reminderId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_reminders')
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Error disabling reminder: ${error.message}`);
      }
    } catch (error) {
      console.error('ReminderService.disableReminder error:', error);
      throw error;
    }
  }

  /**
   * Eliminar recordatorio
   */
  async deleteReminder(reminderId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Error deleting reminder: ${error.message}`);
      }
    } catch (error) {
      console.error('ReminderService.deleteReminder error:', error);
      throw error;
    }
  }

  /**
   * Mapear datos de Supabase a StudyReminder
   */
  private mapToStudyReminder(data: any): StudyReminder {
    return {
      id: data.id,
      user_id: data.user_id,
      frequency: data.frequency,
      preferred_time: data.preferred_time,
      enabled: data.enabled,
      custom_days: data.custom_days || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}

export default new ReminderService();
