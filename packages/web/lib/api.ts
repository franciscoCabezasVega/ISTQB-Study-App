import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          // Buscar primero en localStorage, luego en sessionStorage
          const token = localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage');
          if (token) {
            try {
              const parsed = JSON.parse(token);
              if (parsed.state?.accessToken) {
                config.headers.Authorization = `Bearer ${parsed.state.accessToken}`;
              }
            } catch (e) {
              console.error('Error parsing token from storage');
            }
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de autenticación
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          if (typeof window !== 'undefined') {
            // Limpiar estado de autenticación en AMBOS storages
            localStorage.removeItem('auth-storage');
            sessionStorage.removeItem('auth-storage');
            
            // Solo redirigir si no estamos ya en páginas de auth
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/auth/')) {
              // Mostrar mensaje antes de redirigir
              console.warn('Session expired. Please sign in again.');
              
              // Redirigir al login con mensaje
              window.location.href = '/auth/signin?expired=true';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  signup(email: string, password: string, fullName: string) {
    return this.client.post('/auth/signup', { email, password, fullName });
  }

  signin(email: string, password: string) {
    return this.client.post('/auth/signin', { email, password });
  }

  getCurrentUser() {
    return this.client.get('/auth/me');
  }

  updateUser(data: any) {
    return this.client.put('/auth/me', data);
  }

  // Questions endpoints
  getQuestion(id: string, language?: 'es' | 'en') {
    return this.client.get(`/questions/${id}`, { params: { language } });
  }

  getQuestionsByTopic(topic: string, language?: 'es' | 'en', limit?: number) {
    const encoded = encodeURIComponent(topic);
    return this.client.get(`/questions/topic/${encoded}`, {
      params: { language, limit },
    });
  }

  getQuestionsForExam(count: number = 40, language?: 'es' | 'en') {
    return this.client.get('/questions', { params: { count, language } });
  }

  getQuestionCountByTopic() {
    return this.client.get('/questions/count-by-topic');
  }

  // Answers endpoints
  submitAnswer(data: any) {
    return this.client.post('/answers', data);
  }

  getAnswerHistory(limit?: number) {
    return this.client.get('/answers/history', { params: { limit } });
  }

  getIncorrectAnswers() {
    return this.client.get('/answers/errors');
  }

  getStatistics() {
    return this.client.get('/answers/statistics');
  }

  // Study mode endpoints (separate from exam mode)
  submitStudyAnswer(data: {
    questionId: string;
    selectedOptions: string[];
    isCorrect: boolean;
    timeSpentSeconds?: number;
    attemptNumber?: number;
  }) {
    return this.client.post('/study/answers', data);
  }

  getOrCreateStudySession(topic?: string) {
    return this.client.get('/study/session', { params: { topic } });
  }

  completeStudySession(sessionId: string) {
    return this.client.post(`/study/session/${sessionId}/complete`);
  }

  getStudyHistory(limit?: number) {
    return this.client.get('/study/history', { params: { limit } });
  }

  getStudyErrors() {
    return this.client.get('/study/errors');
  }

  getStudySessions(limit?: number) {
    return this.client.get('/study/sessions', { params: { limit } });
  }

  getStudyStats() {
    return this.client.get('/study/stats');
  }

  // Exam endpoints
  createExamSession(language: string = 'es') {
    return this.client.post('/exams', { language });
  }

  submitExamAnswer(sessionId: string, questionId: string, selectedAnswerId: string, timeSpent: number) {
    return this.client.post(`/exams/${sessionId}/answers`, {
      questionId,
      selectedAnswerId,
      timeSpent,
    });
  }

  submitExamAnswersBatch(
    sessionId: string, 
    answers: Array<{ questionId: string; selectedAnswerId: string; timeSpent: number }>
  ) {
    return this.client.post(`/exams/${sessionId}/answers/batch`, { answers });
  }

  completeExamSession(sessionId: string) {
    return this.client.post(`/exams/${sessionId}/complete`);
  }

  getExamResults(sessionId: string) {
    return this.client.get(`/exams/${sessionId}`);
  }

  // Reminders endpoints
  getReminder() {
    return this.client.get('/reminders');
  }

  createOrUpdateReminder(data: { 
    frequency: 'daily' | 'weekly' | 'custom'; 
    preferredTime?: string; 
    enabled?: boolean;
    customDays?: number[];
  }) {
    return this.client.post('/reminders', data);
  }

  updateReminder(id: string, data: { 
    frequency?: 'daily' | 'weekly' | 'custom'; 
    preferredTime?: string; 
    enabled?: boolean;
    customDays?: number[];
  }) {
    return this.client.put(`/reminders/${id}`, data);
  }

  deleteReminder(id: string) {
    return this.client.delete(`/reminders/${id}`);
  }

  // Achievements endpoints
  getAllAchievements(language?: 'es' | 'en') {
    return this.client.get('/achievements', { params: { language } });
  }

  getUserAchievements() {
    return this.client.get('/achievements/user');
  }

  getUserStreak() {
    return this.client.get('/achievements/streak');
  }

  // User preferences
  getUserProfile() {
    return this.client.get('/users/profile');
  }

  updateLanguagePreference(language: 'es' | 'en') {
    return this.client.put('/users/language', { language });
  }

  updateThemePreference(theme: 'light' | 'dark') {
    return this.client.put('/users/theme', { theme });
  }
}

export const apiClient = new APIClient();
