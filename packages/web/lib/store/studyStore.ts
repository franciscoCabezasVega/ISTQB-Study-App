import { create } from 'zustand';
import { Question, UserAnswer } from '@istqb-app/shared';

interface StudyState {
  currentQuestion: Question | null;
  questions: Question[];
  userAnswers: UserAnswer[];
  currentTopic: string;
  successRate: number;
  
  setCurrentQuestion: (question: Question) => void;
  setQuestions: (questions: Question[]) => void;
  addUserAnswer: (answer: UserAnswer) => void;
  setCurrentTopic: (topic: string) => void;
  setSuccessRate: (rate: number) => void;
  resetStudySession: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  currentQuestion: null,
  questions: [],
  userAnswers: [],
  currentTopic: '',
  successRate: 0,

  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setQuestions: (questions) => set({ questions }),
  addUserAnswer: (answer) =>
    set((state) => ({
      userAnswers: [...state.userAnswers, answer],
    })),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setSuccessRate: (rate) => set({ successRate: rate }),
  resetStudySession: () =>
    set({
      currentQuestion: null,
      questions: [],
      userAnswers: [],
      currentTopic: '',
      successRate: 0,
    }),
}));
