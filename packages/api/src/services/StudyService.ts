import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * StudyService - Servicio para modo de estudio (práctica casual)
 * Usa tablas separadas: study_sessions y study_answers
 * A diferencia de ExamService, no requiere tiempo límite ni time tracking estricto
 */
export class StudyService {
  /**
   * Crear o recuperar sesión de estudio activa
   */
  static async getOrCreateStudySession(
    userId: string,
    topic?: string,
    difficulty?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Buscar sesión activa
    const { data: activeSessions, error: searchError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .limit(1);

    if (searchError) {
      throw { statusCode: 500, message: `Failed to search sessions: ${searchError.message}` };
    }

    // Si existe sesión activa, actualizarla y devolverla
    if (activeSessions && activeSessions.length > 0) {
      const session = activeSessions[0];
      
      // Actualizar última actividad
      const { error: updateError } = await supabase
        .from('study_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', session.id);

      if (updateError) {
        console.error('Error updating session activity:', updateError);
      }

      return session;
    }

    // Crear nueva sesión
    const sessionId = uuidv4();
    const { data: newSession, error: createError } = await supabase
      .from('study_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        topic: topic || null,
        difficulty: difficulty || null,
        questions_count: 0,
        correct_answers: 0,
        status: 'active',
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      throw { statusCode: 500, message: `Failed to create session: ${createError.message}` };
    }

    return newSession;
  }

  /**
   * Registrar respuesta en modo estudio
   * NOTA: timeSpentSeconds es opcional (puede ser 0) ya que no es crítico en study mode
   */
  static async recordStudyAnswer(
    userId: string,
    questionId: string,
    selectedOptions: string[],
    isCorrect: boolean,
    timeSpentSeconds: number = 0,
    attemptNumber: number = 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Obtener o crear sesión activa
    const session = await this.getOrCreateStudySession(userId);

    const answerId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('study_answers')
      .insert({
        id: answerId,
        study_session_id: session.id,
        user_id: userId,
        question_id: questionId,
        selected_options: selectedOptions,
        is_correct: isCorrect,
        time_spent_seconds: timeSpentSeconds || 0, // Default a 0 si no se proporciona
        answered_at: now,
        attempt_number: attemptNumber,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording study answer:', error);
      throw { statusCode: 500, message: `Failed to record answer: ${error.message}` };
    }

    // Actualizar contadores de la sesión
    await this.updateSessionStats(session.id, isCorrect);

    return data;
  }

  /**
   * Actualizar estadísticas de la sesión
   */
  private static async updateSessionStats(sessionId: string, isCorrect: boolean) {
    const { data: session, error: fetchError } = await supabase
      .from('study_sessions')
      .select('questions_count, correct_answers')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      console.error('Error fetching session for stats update:', fetchError);
      return;
    }

    const newQuestionsCount = (session.questions_count || 0) + 1;
    const newCorrectAnswers = (session.correct_answers || 0) + (isCorrect ? 1 : 0);

    const { error: updateError } = await supabase
      .from('study_sessions')
      .update({
        questions_count: newQuestionsCount,
        correct_answers: newCorrectAnswers,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session stats:', updateError);
    }
  }

  /**
   * Obtener historial de respuestas en modo estudio
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getStudyAnswerHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('study_answers')
      .select(`
        *,
        questions (
          id,
          topic,
          difficulty,
          question_text_es,
          question_text_en
        )
      `)
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch study history' };
    }

    return data || [];
  }

  /**
   * Obtener respuestas incorrectas (banco de errores en modo estudio)
   */
  static async getIncorrectStudyAnswers(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('study_answers')
      .select(`
        *,
        questions (
          id,
          topic,
          difficulty,
          question_text_es,
          question_text_en,
          options,
          correct_answer_ids,
          explanation_es,
          explanation_en
        )
      `)
      .eq('user_id', userId)
      .eq('is_correct', false)
      .order('answered_at', { ascending: false });

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch incorrect answers' };
    }

    return data || [];
  }

  /**
   * Completar sesión de estudio
   */
  static async completeStudySession(sessionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw { statusCode: 500, message: `Failed to complete session: ${error.message}` };
    }

    return data;
  }

  /**
   * Obtener sesiones de estudio del usuario
   */
  static async getUserStudySessions(userId: string, limit: number = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch study sessions' };
    }

    return data || [];
  }

  /**
   * Obtener estadísticas de estudio
   */
  static async getStudyStats(userId: string): Promise<any> {
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId);

    const { data: answers, error: answersError } = await supabase
      .from('study_answers')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError || answersError) {
      throw { statusCode: 500, message: 'Failed to fetch study stats' };
    }

    const totalQuestions = answers?.length || 0;
    const correctAnswers = answers?.filter((a: any) => a.is_correct).length || 0;
    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter((s: any) => s.status === 'completed').length || 0;

    return {
      totalQuestions,
      correctAnswers,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      totalSessions,
      completedSessions,
      activeSessions: sessions?.filter((s: any) => s.status === 'active').length || 0,
    };
  }
}

export default StudyService;
