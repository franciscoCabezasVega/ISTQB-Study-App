/**
 * Tests para SpacedRepetitionService
 * Cubre el algoritmo SM-2 de repetición espaciada
 */

import { SpacedRepetitionService } from './SpacedRepetitionService';

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');

describe('SpacedRepetitionService', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockLte: jest.Mock;
  let mockOrder: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSingle = jest.fn();
    mockOrder = jest.fn().mockReturnValue({ data: [], error: null });
    mockLte = jest.fn().mockReturnValue({ order: mockOrder });
    mockEq = jest.fn().mockReturnValue({ 
      single: mockSingle, 
      select: jest.fn().mockReturnValue({ single: mockSingle }),
      lte: mockLte,
    });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq, single: mockSingle });
    mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, select: mockSelect });
    
    mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });

    supabase.from = mockFrom;
  });

  describe('createCard', () => {
    const mockCard = {
      id: 'card-123',
      user_id: 'user-123',
      question_id: 'q1',
      ease_factor: 2.5,
      interval: 1,
      repetitions: 0,
      next_review_date: expect.any(String),
      last_reviewed: expect.any(String),
    };

    it('should create a new spaced repetition card', async () => {
      mockSingle.mockResolvedValue({
        data: mockCard,
        error: null,
      });

      const result = await SpacedRepetitionService.createCard('user-123', 'q1');

      expect(mockFrom).toHaveBeenCalledWith('spaced_repetition_cards');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          question_id: 'q1',
          ease_factor: 2.5,
          interval: 1,
          repetitions: 0,
        })
      );
      expect(result).toMatchObject({
        user_id: 'user-123',
        question_id: 'q1',
        ease_factor: 2.5,
      });
    });

    it('should throw error on database failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(
        SpacedRepetitionService.createCard('user-123', 'q1')
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to create spaced repetition card',
      });
    });
  });

  describe('updateCard', () => {
    const mockExistingCard = {
      id: 'card-123',
      ease_factor: 2.5,
      interval: 1,
      repetitions: 0,
    };

    it('should update card with quality 5 (perfect answer)', async () => {
      // Mock para fetch
      mockSingle.mockResolvedValueOnce({
        data: mockExistingCard,
        error: null,
      });

      // Mock para update
      mockSingle.mockResolvedValueOnce({
        data: {
          ...mockExistingCard,
          ease_factor: 2.6,
          interval: 1,
          repetitions: 1,
        },
        error: null,
      });

      const result = await SpacedRepetitionService.updateCard('card-123', 5);

      expect(result.ease_factor).toBeGreaterThan(2.5);
      expect(result.repetitions).toBe(1);
    });

    it('should update card with quality 0 (complete forget)', async () => {
      const cardWithProgress = {
        id: 'card-123',
        ease_factor: 2.8,
        interval: 10,
        repetitions: 5,
      };

      mockSingle.mockResolvedValueOnce({
        data: cardWithProgress,
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: {
          ...cardWithProgress,
          interval: 1,
          repetitions: 0,
        },
        error: null,
      });

      const result = await SpacedRepetitionService.updateCard('card-123', 0);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it('should throw error if quality is out of range (negative)', async () => {
      await expect(
        SpacedRepetitionService.updateCard('card-123', -1)
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Quality must be between 0 and 5',
      });
    });

    it('should throw error if quality is out of range (too high)', async () => {
      await expect(
        SpacedRepetitionService.updateCard('card-123', 6)
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Quality must be between 0 and 5',
      });
    });

    it('should throw error if card not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        SpacedRepetitionService.updateCard('invalid-card', 3)
      ).rejects.toEqual({
        statusCode: 404,
        message: 'Card not found',
      });
    });

    it('should throw error on update failure', async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockExistingCard,
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        SpacedRepetitionService.updateCard('card-123', 3)
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to update card',
      });
    });

    it('should handle quality 3 (correct with difficulty)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: mockExistingCard,
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: {
          ...mockExistingCard,
          repetitions: 1,
          interval: 1,
        },
        error: null,
      });

      const result = await SpacedRepetitionService.updateCard('card-123', 3);

      expect(result.repetitions).toBe(1);
    });
  });

  describe('getDueCards', () => {
    const mockDueCards = [
      {
        id: 'card-1',
        user_id: 'user-123',
        question_id: 'q1',
        next_review_date: '2026-01-01T10:00:00Z',
      },
      {
        id: 'card-2',
        user_id: 'user-123',
        question_id: 'q2',
        next_review_date: '2026-01-01T11:00:00Z',
      },
    ];

    it('should return due cards for user', async () => {
      mockOrder.mockReturnValue({
        data: mockDueCards,
        error: null,
      });

      const result = await SpacedRepetitionService.getDueCards('user-123');

      expect(mockFrom).toHaveBeenCalledWith('spaced_repetition_cards');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockLte).toHaveBeenCalledWith('next_review_date', expect.any(String));
      expect(mockOrder).toHaveBeenCalledWith('next_review_date', { ascending: true });
      expect(result).toEqual(mockDueCards);
    });

    it('should return empty array if no due cards', async () => {
      mockOrder.mockReturnValue({
        data: [],
        error: null,
      });

      const result = await SpacedRepetitionService.getDueCards('user-new');

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        SpacedRepetitionService.getDueCards('user-123')
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to fetch due cards',
      });
    });
  });
});
