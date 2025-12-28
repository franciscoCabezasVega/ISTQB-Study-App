import { supabase } from '../config/supabase';
import { Question, QuestionDB, DifficultyLevel, QuestionType, Language } from '@istqb-app/shared';
import { v4 as uuidv4 } from 'uuid';

export class QuestionService {
  /**
   * Obtiene una pregunta por ID en el idioma especificado
   */
  static async getQuestionById(id: string, language: Language = 'es'): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw { statusCode: 404, message: 'Question not found' };
    }

    return this.formatQuestion(data, language);
  }

  /**
   * Obtiene preguntas por tema y dificultad en el idioma especificado
   */
  static async getQuestionsByTopic(
    topic: string,
    language: Language = 'es',
    difficulty?: DifficultyLevel,
    limit: number = 10
  ): Promise<Question[]> {
    let query = supabase.from('questions').select('*').eq('topic', topic);

    if (difficulty) {
      // Filtrar por el campo de dificultad traducido
      const difficultyField = language === 'en' ? 'difficulty_en' : 'difficulty_es';
      const difficultyValue = this.getDifficultyLabel(difficulty, language);
      query = query.eq(difficultyField, difficultyValue);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch questions' };
    }

    return data.map((q) => this.formatQuestion(q, language));
  }

  /**
   * Obtiene preguntas aleatorias (para examen simulado) en el idioma especificado
   */
  static async getRandomQuestions(count: number = 40, language: Language = 'es'): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(count);
    // Nota: Supabase no tiene ORDER BY RANDOM() por defecto, se debe hacer en memoria

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch questions' };
    }

    return this.shuffleArray(data).slice(0, count).map((q) => this.formatQuestion(q, language));
  }

  /**
   * Crea una nueva pregunta (solo administradores)
   * Ahora requiere traducciones en ambos idiomas
   */
  static async createQuestion(question: Omit<QuestionDB, 'id' | 'created_at' | 'updated_at'>): Promise<Question> {
    const questionId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('questions')
      .insert({
        id: questionId,
        ...question,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw { statusCode: 500, message: 'Failed to create question' };
    }

    // Return in Spanish by default
    return this.formatQuestion(data, 'es');
  }

  /**
   * Obtiene todas las preguntas de un tema para examen en el idioma especificado
   */
  static async getQuestionsForExam(count: number = 40, language: Language = 'es'): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(count * 2); // Obtener más para poder seleccionar aleatoriamente

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch questions' };
    }

    const shuffled = this.shuffleArray(data);
    return shuffled.slice(0, count).map((q) => this.formatQuestion(q, language));
  }

  // Métodos auxiliares
  
  /**
   * Formatea una pregunta de la base de datos al formato de respuesta API
   * Selecciona el idioma apropiado y hace fallback a español si no existe traducción
   */
  private static formatQuestion(data: any, language: Language = 'es'): Question {
    // Determine which language fields to use
    const useEnglish = language === 'en' && data.title_en != null;
    
    return {
      id: data.id,
      title: useEnglish ? data.title_en : data.title_es,
      description: useEnglish ? (data.description_en || data.description_es) : data.description_es,
      type: data.type as QuestionType,
      difficultyLabel: useEnglish ? (data.difficulty_en || data.difficulty_es) : (data.difficulty_es || 'N/A'),
      topic: data.topic,
      options: useEnglish ? (data.options_en || data.options_es || []) : (data.options_es || []),
      correct_answer_ids: data.correct_answer_ids || [],
      explanation: useEnglish ? (data.description_en || data.description_es) : data.description_es, // Use description as explanation
      created_at: data.created_at,
      updated_at: data.updated_at,
      language: useEnglish ? 'en' : 'es',
    };
  }

  /**
   * Convierte el nivel de dificultad al label traducido
   */
  private static getDifficultyLabel(difficulty: DifficultyLevel, language: Language = 'es'): string {
    const labels = {
      es: {
        easy: 'Fácil',
        medium: 'Medio',
        hard: 'Difícil',
      },
      en: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
      },
    };
    
    return labels[language][difficulty] || difficulty;
  }

  /**
   * Obtiene la cantidad de preguntas disponibles por dificultad
   */
  static async getQuestionCountByDifficulty(language: Language = 'es'): Promise<{
    easy: number;
    medium: number;
    hard: number;
  }> {
    const difficultyField = language === 'en' ? 'difficulty_en' : 'difficulty_es';
    const labels = {
      easy: language === 'en' ? 'Easy' : 'Fácil',
      medium: language === 'en' ? 'Medium' : 'Medio',
      hard: language === 'en' ? 'Hard' : 'Difícil',
    };

    // Obtener conteo para cada dificultad
    const { count: easyCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq(difficultyField, labels.easy);

    const { count: mediumCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq(difficultyField, labels.medium);

    const { count: hardCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq(difficultyField, labels.hard);

    return {
      easy: easyCount || 0,
      medium: mediumCount || 0,
      hard: hardCount || 0,
    };
  }

  /**
   * Obtiene el contador de preguntas disponibles por tema
   */
  static async getQuestionCountByTopic(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('questions')
      .select('topic');

    if (error) {
      throw { statusCode: 500, message: 'Failed to count questions by topic' };
    }

    // Agrupar y contar por tema
    const counts: Record<string, number> = {};
    data.forEach((q) => {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });

    return counts;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
