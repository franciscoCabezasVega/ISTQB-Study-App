import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { QuestionService } from './QuestionService';
import { Language } from '@istqb-app/shared';

export interface ExamSessionRequest {
  userId: string;
  numberOfQuestions: number;
  language?: Language;
}

export interface ExamAnswer {
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ExamSessionResponse {
  sessionId: string;
  userId: string;
  createdAt: string;
  totalQuestions: number;
  questions: any[];
}

export interface ExamResultsResponse {
  sessionId: string;
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // porcentaje 0-100
  passed: boolean; // > 65%
  answers: ExamAnswer[];
  timeElapsed: number; // en segundos
  createdAt: string;
  completedAt: string;
  breakdownByTopic: Record<string, { correct: number; total: number }>;
}

class ExamService {
  /**
   * Obtiene el idioma preferido del usuario desde su perfil
   */
  private async getUserLanguage(userId: string): Promise<Language> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('language')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return 'es'; // Default fallback
      }

      return (data.language as Language) || 'es';
    } catch (error) {
      console.error('Error getting user language:', error);
      return 'es';
    }
  }

  /**
   * Crear una nueva sesión de examen
   * Ahora obtiene preguntas en el idioma del usuario siguiendo la distribución oficial ISTQB
   */
  async createExamSession(
    userId: string,
    numberOfQuestions: number = 40
  ): Promise<ExamSessionResponse> {
    try {
      // Obtener idioma del usuario
      const userLanguage = await this.getUserLanguage(userId);

      // Distribución oficial ISTQB por capítulo (total 40 preguntas)
      const questionDistribution = {
        'Fundamentals of Testing': 8,
        'Testing Throughout the Software Development Lifecycle': 6,
        'Static Testing': 4,
        'Test Analysis and Design': 11,
        'Managing the Test Activities': 9,
        'Test Tools': 2,
      };

      // Obtener preguntas por cada tema según la distribución
      const allQuestions: any[] = [];
      
      for (const [topic, count] of Object.entries(questionDistribution)) {
        // Obtener más preguntas de las necesarias para poder seleccionar aleatoriamente
        const topicQuestions = await QuestionService.getQuestionsByTopic(
          topic,
          userLanguage,
          count * 3 // Obtener el triple para tener variedad
        );

        // Mezclar las preguntas del tema
        const shuffled = this.shuffleArray(topicQuestions);
        
        // Tomar solo el número necesario
        const selectedQuestions = shuffled.slice(0, count);
        
        if (selectedQuestions.length < count) {
          console.warn(`⚠️ Topic "${topic}" has only ${selectedQuestions.length} questions, needed ${count}`);
        }
        
        allQuestions.push(...selectedQuestions);
      }

      // Verificar que tenemos suficientes preguntas
      if (allQuestions.length === 0) {
        throw new Error('No questions available');
      }

      // Mezclar todas las preguntas para que no estén ordenadas por tema
      const shuffledQuestions = this.shuffleArray(allQuestions);

      // Crear sesión de examen en la BD
      const sessionId = uuidv4();
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          total_questions: shuffledQuestions.length,
          questions: shuffledQuestions.map((q: any) => ({ id: q.id, title: q.title })),
          started_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Error creating exam session: ${sessionError.message}`);
      }

      return {
        sessionId: session.id,
        userId: session.user_id,
        createdAt: session.started_at,
        totalQuestions: shuffledQuestions.length,
        questions: shuffledQuestions,
      };
    } catch (error) {
      console.error('ExamService.createExamSession error:', error);
      throw error;
    }
  }

  /**
   * Método auxiliar para mezclar un array (Fisher-Yates shuffle)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Guardar respuesta en sesión de examen
   */
  async submitExamAnswer(
    sessionId: string,
    questionId: string,
    selectedAnswerId: string | string[],
    timeSpent: number
  ): Promise<{ isCorrect: boolean }> {
    try {
      // Obtener la sesión de examen para obtener el user_id
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error(`Error fetching exam session: ${sessionError?.message}`);
      }

      // Obtener la pregunta para validar respuesta
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError) {
        throw new Error(`Error fetching question: ${questionError.message}`);
      }

      // Convertir selectedAnswerId a array si no lo es
      const selectedOptions = Array.isArray(selectedAnswerId) ? selectedAnswerId : [selectedAnswerId];

      // Validar respuesta
      const correctAnswers = question.correct_answer_ids || [];
      const isCorrect = 
        selectedOptions.length === correctAnswers.length &&
        selectedOptions.every((opt: string) => correctAnswers.includes(opt));

      // Las respuestas de examen se guardan en exam_answers, no en user_answers
      // Este método ya no se usa activamente; submitExamAnswersBatch es el método principal

      return { isCorrect };
    } catch (error) {
      console.error('ExamService.submitExamAnswer error:', error);
      throw error;
    }
  }

  /**
   * Enviar múltiples respuestas de examen en batch (optimizado)
   */
  async submitExamAnswersBatch(
    sessionId: string,
    answers: Array<{
      questionId: string;
      selectedAnswerId: string | string[];
      timeSpent: number;
    }>
  ): Promise<{ saved: number; results: Array<{ questionId: string; isCorrect: boolean }> }> {
    try {
      console.log('📝 submitExamAnswersBatch - Received answers:', JSON.stringify(answers.map(a => ({ 
        questionId: a.questionId, 
        timeSpent: a.timeSpent 
      })), null, 2));

      // Obtener la sesión de examen para obtener el user_id
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error(`Error fetching exam session: ${sessionError?.message}`);
      }

      // Obtener todas las preguntas en una sola query
      const questionIds = answers.map(a => a.questionId);
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);

      if (questionsError) {
        throw new Error(`Error fetching questions: ${questionsError.message}`);
      }

      // Crear mapa de preguntas para acceso rápido
      const questionsMap = new Map(questions.map(q => [q.id, q]));

      // Preparar datos para inserción batch
      const examAnswersToInsert = [];
      const results = [];

      for (const answer of answers) {
        const question = questionsMap.get(answer.questionId);
        if (!question) {
          console.warn(`Question ${answer.questionId} not found`);
          continue;
        }

        // Convertir selectedAnswerId a array si no lo es
        const selectedOptions = Array.isArray(answer.selectedAnswerId) 
          ? answer.selectedAnswerId 
          : [answer.selectedAnswerId];

        // Validar respuesta
        const correctAnswers = question.correct_answer_ids || [];
        const isCorrect = 
          selectedOptions.length === correctAnswers.length &&
          selectedOptions.every((opt: string) => correctAnswers.includes(opt));

        examAnswersToInsert.push({
          exam_session_id: sessionId,
          question_id: answer.questionId,
          selected_answer_id: selectedOptions[0], // Guardar primera opción seleccionada
          is_correct: isCorrect,
          time_spent_seconds: answer.timeSpent || 0,
        });

        console.log(`💾 Question ${answer.questionId}: timeSpent = ${answer.timeSpent}`);

        results.push({
          questionId: answer.questionId,
          isCorrect,
        });
      }

      console.log('📝 Total answers to insert:', examAnswersToInsert.length);
      console.log('⏱️  Tiempo total calculado:', examAnswersToInsert.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0));

      // Insertar todas las respuestas en una sola operación
      if (examAnswersToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('exam_answers')
          .insert(examAnswersToInsert);

        if (insertError) {
          throw new Error(`Error saving answers: ${insertError.message}`);
        }
      }

      return {
        saved: examAnswersToInsert.length,
        results,
      };
    } catch (error) {
      console.error('ExamService.submitExamAnswersBatch error:', error);
      throw error;
    }
  }

  /**
   * Finalizar sesión de examen y obtener resultados
   */
  async completeExamSession(sessionId: string): Promise<ExamResultsResponse> {
    try {
      // Obtener sesión
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error(`Error fetching session: ${sessionError.message}`);
      }

      // Obtener respuestas
      const { data: answers, error: answersError } = await supabase
        .from('exam_answers')
        .select(
          `
          *,
          questions(id, topic)
        `
        )
        .eq('exam_session_id', sessionId);

      if (answersError) {
        throw new Error(`Error fetching answers: ${answersError.message}`);
      }

      // Calcular resultados
      const correctAnswers = answers.filter((a: any) => a.is_correct).length;
      const totalQuestions = session.total_questions;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= 65;

      // Breakdown por tema
      const breakdownByTopic: Record<string, { correct: number; total: number }> = {};
      answers.forEach((answer: any) => {
        const topic = answer.questions?.topic || 'Unknown';
        if (!breakdownByTopic[topic]) {
          breakdownByTopic[topic] = { correct: 0, total: 0 };
        }
        breakdownByTopic[topic].total += 1;
        if (answer.is_correct) {
          breakdownByTopic[topic].correct += 1;
        }
      });

      // Calcular tiempo total
      const timeElapsed = answers.reduce((sum: number, a: any) => sum + (a.time_spent_seconds || 0), 0);

      console.log('⏱️  completeExamSession - Total answers:', answers.length);
      console.log('⏱️  completeExamSession - timeElapsed calculated:', timeElapsed);
      console.log('⏱️  completeExamSession - Sample answer:', JSON.stringify(answers[0], null, 2));

      // Actualizar sesión
      const { error: updateError } = await supabase
        .from('exam_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: score,
          total_time_spent: timeElapsed,
        })
        .eq('id', sessionId);

      if (updateError) {
        throw new Error(`Error updating session: ${updateError.message}`);
      }

      // Actualizar progreso del usuario
      await this.updateUserProgress(session.user_id, answers);

      // Actualizar streak y verificar logros (asíncrono, no bloquea la respuesta)
      const AchievementService = require('./AchievementService').default;
      AchievementService.updateStreak(session.user_id).catch(console.error);
      AchievementService.checkAndUnlockAchievements(session.user_id).catch(console.error);

      return {
        sessionId: session.id,
        userId: session.user_id,
        totalQuestions,
        correctAnswers,
        score,
        passed,
        answers: answers.map((a: any) => ({
          questionId: a.question_id,
          selectedAnswerId: a.selected_answer_id,
          isCorrect: a.is_correct,
          timeSpent: a.time_spent_seconds || 0,
        })),
        timeElapsed,
        createdAt: session.started_at,
        completedAt: new Date().toISOString(),
        breakdownByTopic,
      };
    } catch (error) {
      console.error('ExamService.completeExamSession error:', error);
      throw error;
    }
  }

  /**
   * Obtener resultados de una sesión de examen
   */
  async getExamResults(sessionId: string): Promise<ExamResultsResponse> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error(`Error fetching session: ${sessionError.message}`);
      }

      const { data: answers, error: answersError } = await supabase
        .from('exam_answers')
        .select(
          `
          *,
          questions(id, topic)
        `
        )
        .eq('exam_session_id', sessionId);

      if (answersError) {
        throw new Error(`Error fetching answers: ${answersError.message}`);
      }

      const correctAnswers = answers.filter((a: any) => a.is_correct).length;
      const totalQuestions = session.total_questions;
      const score = session.score || (correctAnswers / totalQuestions) * 100;

      const breakdownByTopic: Record<string, { correct: number; total: number }> = {};
      answers.forEach((answer: any) => {
        const topic = answer.questions?.topic || 'Unknown';
        if (!breakdownByTopic[topic]) {
          breakdownByTopic[topic] = { correct: 0, total: 0 };
        }
        breakdownByTopic[topic].total += 1;
        if (answer.is_correct) {
          breakdownByTopic[topic].correct += 1;
        }
      });

      return {
        sessionId: session.id,
        userId: session.user_id,
        totalQuestions,
        correctAnswers,
        score,
        passed: score >= 65,
        answers: answers.map((a: any) => ({
          questionId: a.question_id,
          selectedAnswerId: a.selected_answer_id,
          isCorrect: a.is_correct,
          timeSpent: a.time_spent_seconds || 0,
        })),
        timeElapsed: session.total_time_spent || 0,
        createdAt: session.started_at,
        completedAt: session.completed_at || new Date().toISOString(),
        breakdownByTopic,
      };
    } catch (error) {
      console.error('ExamService.getExamResults error:', error);
      throw error;
    }
  }

  /**
   * Actualizar progreso del usuario después del examen
   */
  private async updateUserProgress(userId: string, answers: any[]): Promise<void> {
    try {
      const topicStats: Record<string, { correct: number; total: number }> = {};

      answers.forEach((answer) => {
        const topic = answer.questions?.topic || 'Unknown';
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, total: 0 };
        }
        topicStats[topic].total += 1;
        if (answer.is_correct) {
          topicStats[topic].correct += 1;
        }
      });

      // Actualizar cada tema
      for (const [topic, stats] of Object.entries(topicStats)) {
        const { data: existing } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('topic', topic)
          .single();

        if (existing) {
          await supabase
            .from('user_progress')
            .update({
              total_questions: existing.total_questions + stats.total,
              correct_answers: existing.correct_answers + stats.correct,
              last_studied: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('user_progress').insert({
            user_id: userId,
            topic,
            total_questions: stats.total,
            correct_answers: stats.correct,
            last_studied: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('ExamService.updateUserProgress error:', error);
      // No throw - this is non-critical
    }
  }
}

export default new ExamService();
