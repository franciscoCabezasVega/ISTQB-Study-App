import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { APIError } from '@istqb-app/shared';

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Access token required',
    } as APIError);
  }

  try {
    // Validate token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
      } as APIError);
    }

    req.user = {
      id: user.id,
      email: user.email || '',
    };
    next();
  } catch (error) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid or expired token',
    } as APIError);
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { details: err }),
  } as APIError);
};
