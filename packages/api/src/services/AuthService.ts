import { supabase } from '../config/supabase.js';
import { User, AuthResponse } from '@istqb-app/shared';

// URL de la aplicación frontend (para redirecciones de email)
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export interface SignupResult {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  } | null;
  confirmationRequired: boolean;
}

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  static async signup(email: string, password: string, fullName: string): Promise<SignupResult> {
    // Validación
    if (!email || !password || !fullName) {
      throw { statusCode: 400, message: 'Email, password, and full name are required' };
    }

    // Crear usuario en Supabase Auth con redirectTo para email de confirmación
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
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

    // Si no hay sesión, es porque se requiere confirmación de email
    const confirmationRequired = !authData.session;

    return {
      user: userData as User,
      session: authData.session ? {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in,
      } : null,
      confirmationRequired,
    };
  }

  /**
   * Solicita reset de contraseña
   */
  static async forgotPassword(email: string): Promise<void> {
    if (!email) {
      throw { statusCode: 400, message: 'Email is required' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/auth/callback`,
    });

    if (error) {
      // Rate-limit de Supabase -> 429 con código limpio (nunca exponer el mensaje crudo)
      if (
        error.message.toLowerCase().includes('security purposes') ||
        error.message.toLowerCase().includes('rate limit')
      ) {
        throw { statusCode: 429, message: 'RATE_LIMIT_EXCEEDED' };
      }
      throw { statusCode: 400, message: 'FORGOT_PASSWORD_FAILED' };
    }
  }

  /**
   * Resetea la contraseña usando un access_token de recuperación
   */
  static async resetPassword(accessToken: string, newPassword: string): Promise<void> {
    if (!accessToken || !newPassword) {
      throw { statusCode: 400, message: 'Access token and new password are required' };
    }

    // Verificar el token para obtener el usuario
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(accessToken);

    if (verifyError || !user) {
      throw { statusCode: 401, message: 'Invalid or expired reset token' };
    }

    // Actualizar la contraseña usando admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      throw { statusCode: 500, message: 'Failed to update password' };
    }
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
