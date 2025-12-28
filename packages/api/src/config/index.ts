export interface Config {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  jwtSecret: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const config: Config = {
  port: parseInt(process.env.API_PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
};
