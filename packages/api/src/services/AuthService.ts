import { supabase } from '../config/supabase';
import { User, AuthResponse } from '@istqb-app/shared';

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  static async signup(email: string, password: string, fullName: string): Promise<AuthResponse> {
    // Validación
    if (!email || !password || !fullName) {
      throw { statusCode: 400, message: 'Email, password, and full name are required' };
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw { statusCode: 400, message: authError.message };
    }

    if (!authData.user) {
      throw { statusCode: 500, message: 'Failed to create user' };
    }

    // Crear registro de usuario en tabla users
    const userId = authData.user.id;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        language: 'es',
        theme: 'light',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      throw { statusCode: 500, message: 'Failed to create user profile' };
    }

    return {
      user: userData as User,
      session: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_in: authData.session?.expires_in || 3600,
      },
    };
  }

  /**
   * Inicia sesión de usuario
   */
  static async signin(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (!data.user) {
      throw { statusCode: 500, message: 'Authentication failed' };
    }

    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      throw { statusCode: 500, message: 'Failed to fetch user data' };
    }

    return {
      user: userData as User,
      session: {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || '',
        expires_in: data.session?.expires_in || 3600,
      },
    };
  }

  /**
   * Obtiene datos del usuario autenticado
   */
  static async getCurrentUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return data as User;
  }

  /**
   * Actualiza datos del usuario
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw { statusCode: 500, message: 'Failed to update user' };
    }

    return data as User;
  }
}
