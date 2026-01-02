export * from './types';
export * from './topicMap';

// Re-exportar constantes y utilidades
export const ISTQB_TOPICS = [
  'Fundamentals of Testing',
  'Testing Throughout the Software Development Lifecycle',
  'Static Testing',
  'Test Analysis and Design',
  'Managing the Test Activities',
  'Test Tools'
] as const;



export const QUESTION_TYPES = ['multiple_choice', 'true_false', 'situational'] as const;

export const LANGUAGES = ['es', 'en'] as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
