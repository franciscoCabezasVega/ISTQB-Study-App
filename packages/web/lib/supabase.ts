import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Singleton pattern para evitar múltiples instancias
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Deshabilitamos la persistencia de Supabase porque usamos nuestro propio authStore
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

// Función para setear el token JWT en las queries de Supabase
export const setSupabaseAuth = (token: string | null) => {
  if (token) {
    console.log('[DEBUG] Setting Supabase auth token');
    // @ts-ignore - rest.headers is protected in latest Supabase version
    supabase.rest.headers = {
      // @ts-ignore - rest.headers is protected in latest Supabase version
      ...supabase.rest.headers,
      // @ts-ignore - Authorization doesn't exist in Headers type
      Authorization: `Bearer ${token}`,
    };
  } else {
    console.log('[DEBUG] Clearing Supabase auth token');
    // @ts-ignore - rest.headers is protected in latest Supabase version
    delete supabase.rest.headers?.Authorization;
  }
};
