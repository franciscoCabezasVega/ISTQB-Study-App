import { supabase } from '../config/supabase';
import { User } from '@istqb-app/shared';

class UserService {
  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuario no encontrado
        }
        throw new Error(`Error fetching user profile: ${error.message}`);
      }

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        language: data.language || 'es',
        theme: data.theme || 'light',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('UserService.getUserProfile error:', error);
      throw error;
    }
  }

  /**
   * Actualizar preferencia de idioma
   */
  async updateLanguagePreference(userId: string, language: 'es' | 'en'): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating language preference: ${error.message}`);
      }

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        language: data.language,
        theme: data.theme,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('UserService.updateLanguagePreference error:', error);
      throw error;
    }
  }

  /**
   * Actualizar tema
   */
  async updateThemePreference(userId: string, theme: 'light' | 'dark'): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          theme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating theme preference: ${error.message}`);
      }

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        language: data.language,
        theme: data.theme,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('UserService.updateThemePreference error:', error);
      throw error;
    }
  }
}

export default new UserService();
