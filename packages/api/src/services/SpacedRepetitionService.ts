import { supabase } from '../config/supabase';
import { SpacedRepetitionCard } from '@istqb-app/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementación del algoritmo SM-2 para repetición espaciada
 * Referencia: https://en.wikipedia.org/wiki/SuperMemo
 */
export class SpacedRepetitionService {
  // Constantes SM-2
  private static readonly INITIAL_EASE_FACTOR = 2.5;
  private static readonly MIN_EASE_FACTOR = 1.3;

  /**
   * Crea una nueva tarjeta de repetición espaciada
   */
  static async createCard(userId: string, questionId: string): Promise<SpacedRepetitionCard> {
    const cardId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert({
        id: cardId,
        user_id: userId,
        question_id: questionId,
        ease_factor: this.INITIAL_EASE_FACTOR,
        interval: 1, // 1 día para la primera revisión
        repetitions: 0,
        next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        last_reviewed: now,
      })
      .select()
      .single();

    if (error) {
      throw { statusCode: 500, message: 'Failed to create spaced repetition card' };
    }

    return data as SpacedRepetitionCard;
  }

  /**
   * Actualiza una tarjeta basada en la calidad de la respuesta (0-5)
   * 0: Olvido completo
   * 3: Respuesta con dificultad
   * 5: Respuesta correcta e inmediata
   */
  static async updateCard(cardId: string, quality: number): Promise<SpacedRepetitionCard> {
    if (quality < 0 || quality > 5) {
      throw { statusCode: 400, message: 'Quality must be between 0 and 5' };
    }

    // Obtener tarjeta actual
    const { data: card, error: fetchError } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (fetchError) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    // Calcular nuevos valores según SM-2
    const { newEaseFactor, newInterval, newRepetitions } = this.calculateSM2(
      card.ease_factor,
      card.interval,
      card.repetitions,
      quality
    );

    // Calcular próxima fecha de revisión
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Actualizar tarjeta
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .update({
        ease_factor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) {
      throw { statusCode: 500, message: 'Failed to update card' };
    }

    return data as SpacedRepetitionCard;
  }

  /**
   * Obtiene las tarjetas pendientes de revisar para un usuario
   */
  static async getDueCards(userId: string): Promise<SpacedRepetitionCard[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review_date', now)
      .order('next_review_date', { ascending: true });

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch due cards' };
    }

    return data as SpacedRepetitionCard[];
  }

  /**
   * Cálculo del algoritmo SM-2
   */
  private static calculateSM2(
    easeFactor: number,
    interval: number,
    repetitions: number,
    quality: number
  ): { newEaseFactor: number; newInterval: number; newRepetitions: number } {
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;

    // Actualizar ease factor
    newEaseFactor = Math.max(
      this.MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    if (quality < 3) {
      // Respuesta incorrecta o muy difícil
      newRepetitions = 0;
      newInterval = 1;
    } else {
      newRepetitions = repetitions + 1;

      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 3;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
    }

    return { newEaseFactor, newInterval, newRepetitions };
  }
}
