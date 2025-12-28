// Tipos de usuario y autenticación
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  language: 'es' | 'en';
  theme: 'light' | 'dark';
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

// Tipos de preguntas y respuestas
export type QuestionType = 'multiple_choice' | 'true_false' | 'situational';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type Language = 'es' | 'en';

// Question structure in database (includes all languages)
export interface QuestionDB {
  id: string;
  // Spanish fields
  title_es: string;
  description_es: string;
  options_es: QuestionOption[];
  explanation_es: string;
  difficulty_es?: string;
  // English fields
  title_en: string | null;
  description_en: string | null;
  options_en: QuestionOption[] | null;
  explanation_en: string | null;
  difficulty_en?: string | null;
  // Common fields (language-independent)
  type: QuestionType;
  topic: string;
  correct_answer_ids: string[];
  created_at: string;
  updated_at: string;
}

// Question structure for API responses (single language)
export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  difficultyLabel?: string;
  topic: string; // ej: "Test Design", "Fundamentals", etc.
  options: QuestionOption[];
  correct_answer_ids: string[];
  explanation: string;
  created_at: string;
  updated_at: string;
  language?: Language; // Idioma actual de la pregunta
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
  explanation?: string; // Explicación específica de esta opción (por qué es correcta o incorrecta)
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_options: string[];
  is_correct: boolean;
  time_spent_seconds: number;
  answered_at: string;
  attempt_number: number;
}

// Tipos de progreso del usuario
export interface UserProgress {
  id: string;
  user_id: string;
  topic: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  success_rate: number;
  last_studied: string;
  next_review_date: string;
}

export interface DailyStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
}

// Tipos de gamificación

// Achievement structure in database (includes all languages)
export interface AchievementDB {
  id: string;
  code: string;
  // Spanish fields
  name_es: string;
  description_es: string;
  // English fields
  name_en: string | null;
  description_en: string | null;
  // Common fields
  icon: string;
  criteria: string; // JSON criteria
  created_at: string;
}

// Achievement structure for API responses (single language)
export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  criteria: string; // JSON criteria
  language?: Language;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

// Tipos de recordatorios
export interface StudyReminder {
  id: string;
  user_id: string;
  frequency: 'daily' | 'weekly' | 'custom';
  preferred_time: string; // HH:MM
  enabled: boolean;
  custom_days?: number[]; // Array de días: 0=Domingo, 1=Lunes, ..., 6=Sábado (solo para frequency='custom')
  created_at: string;
  updated_at: string;
}

// Tipos de examen simulado
export interface ExamSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  questions: string[]; // Array de question IDs
  answers: UserAnswer[];
  score?: number;
  total_time_spent?: number;
  is_completed: boolean;
}

// Tipos de errores comunes
export interface CommonError {
  id: string;
  user_id: string;
  question_id: string;
  error_count: number;
  last_error_date: string;
  concept_involved: string;
}

// Algoritmo de repetición espaciada (SM-2)
export interface SpacedRepetitionCard {
  id: string;
  user_id: string;
  question_id: string;
  ease_factor: number; // Comienza en 2.5
  interval: number; // Días hasta siguiente revisión
  repetitions: number;
  next_review_date: string;
  last_reviewed: string;
}

export interface APIError {
  statusCode: number;
  message: string;
  details?: Record<string, any>;
}
