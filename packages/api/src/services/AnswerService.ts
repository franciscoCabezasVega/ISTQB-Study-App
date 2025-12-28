import { supabase } from '../config/supabase';
import { UserAnswer } from '@istqb-app/shared';

export class AnswerService {
  /**
   * Métodos de recordAnswer, getUserAnswerHistory e getIncorrectAnswers
   * fueron removidos porque user_answers ya no se usa.
   * 
   * El sistema ahora usa:
   * - exam_answers: Para respuestas de exámenes simulados
   * - study_answers: Para respuestas de sesiones de estudio
   * 
   * Ver ExamService y StudyService para la lógica actualizada.
   */

  /**
   * Calcula el porcentaje de aciertos
   * Combina datos de user_answers (exam) y study_answers
   */
  static async getSuccessRate(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_combined_user_success_rate', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching success rate:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Obtiene las estadísticas por tema
   * Combina datos de user_answers (exam) y study_answers
   */
  static async getStatisticsByTopic(userId: string) {
    const { data, error } = await supabase.rpc('get_combined_user_statistics_by_topic', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching statistics:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw { 
        statusCode: 500, 
        message: 'Failed to fetch statistics',
        details: error.message,
        hint: error.hint
      };
    }

    return data;
  }

  /**
   * Obtiene las estadísticas de exámenes del usuario
   */
  static async getExamStatistics(userId: string) {
    const { data, error } = await supabase.rpc('get_exam_statistics', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching exam statistics:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw { 
        statusCode: 500, 
        message: 'Failed to fetch exam statistics',
        details: error.message,
        hint: error.hint
      };
    }

    return data?.[0] || {
      total_exams: 0,
      average_score: 0,
      last_score: 0,
      highest_score: 0,
      exams_passed: 0,
      last_exam_date: null,
    };
  }
}
