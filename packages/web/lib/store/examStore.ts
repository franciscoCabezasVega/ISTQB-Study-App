import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '@istqb-app/shared';

export interface ExamAnswer {
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface ExamState {
  // Estado de sesión
  sessionId: string | null;
  currentQuestionIndex: number;
  answers: ExamAnswer[];
  isActive: boolean;
  startTime: number | null;
  duration: number; // en segundos (3600 = 1 hora)
  timeRemaining: number;
  totalQuestions: number;
  questions: Question[];

  // Acciones
  startExam: (sessionId: string, totalQuestions: number, questions: Question[]) => void;
  submitAnswer: (answer: ExamAnswer) => void;
  nextQuestion: () => void;
  endExam: () => void;
  resetExam: () => void;
  updateTimeRemaining: (remaining: number) => void;
  updateQuestions: (questions: Question[]) => void;
  
  // Getters
  getScore: () => number;
  getCorrectAnswers: () => number;
  getProgress: () => number;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sessionId: null,
      currentQuestionIndex: 0,
      answers: [],
      isActive: false,
      startTime: null,
      duration: 3600, // 60 minutos
      timeRemaining: 3600,
      totalQuestions: 40,
      questions: [],

      // Iniciar examen
      startExam: (sessionId: string, totalQuestions: number, questions: Question[]) => {
        set({
          sessionId,
          totalQuestions,
          questions,
          currentQuestionIndex: 0,
          answers: [],
          isActive: true,
          startTime: Date.now(),
          timeRemaining: 3600,
        });
      },

      // Enviar respuesta
      submitAnswer: (answer: ExamAnswer) => {
        set((state) => ({
          answers: [...state.answers, answer],
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },

      // Siguiente pregunta (sin enviar aún)
      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },

      // Finalizar examen
      endExam: () => {
        set({
          isActive: false,
          sessionId: null,
        });
      },

      // Reset examen
      resetExam: () => {
        set({
          sessionId: null,
          currentQuestionIndex: 0,
          answers: [],
          isActive: false,
          startTime: null,
          timeRemaining: 3600,
          totalQuestions: 40,
        });
      },

      // Actualizar tiempo restante
      updateTimeRemaining: (remaining: number) => {
        set({
          timeRemaining: remaining,
        });
      },

      // Actualizar preguntas (para traducciones)
      updateQuestions: (questions: Question[]) => {
        set({
          questions,
        });
      },

      // Calcular puntaje
      getScore: () => {
        const state = get();
        const correctAnswers = state.answers.filter((a) => a.isCorrect).length;
        return (correctAnswers / state.totalQuestions) * 100;
      },

      // Contar respuestas correctas
      getCorrectAnswers: () => {
        return get().answers.filter((a) => a.isCorrect).length;
      },

      // Progreso en porcentaje
      getProgress: () => {
        const state = get();
        return (state.currentQuestionIndex / state.totalQuestions) * 100;
      },
    }),
    {
      name: 'exam-store',
    }
  )
);
