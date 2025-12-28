/**
 * Tests para ExamService
 * Cubren los casos críticos y errores encontrados durante el desarrollo
 */

import ExamService from '../services/ExamService';

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');

describe('ExamService', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockIn: jest.Mock;
  let mockSingle: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock chain
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    mockIn = jest.fn().mockReturnValue({ eq: mockEq });
    mockLimit = jest.fn().mockReturnValue({ eq: mockEq });
    mockSelect = jest.fn().mockReturnValue({ 
      eq: mockEq, 
      in: mockIn,
      limit: mockLimit,
    });
    mockInsert = jest.fn().mockReturnValue({ eq: mockEq });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
    });

    supabase.from = mockFrom;
  });

  describe('submitExamAnswersBatch', () => {
    const sessionId = 'test-session-id';
    const mockAnswers = [
      { questionId: 'q1', selectedAnswerId: '1', timeSpent: 30 },
      { questionId: 'q2', selectedAnswerId: '2', timeSpent: 45 },
    ];

    it('should accept TEXT IDs (not just UUIDs) for selected answers', async () => {
      // Mock session fetch
      mockSingle.mockResolvedValueOnce({
        data: { user_id: 'user-123' },
        error: null,
      });

      // Mock questions fetch
      mockSelect.mockReturnValueOnce({
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'q1', correct_answer_ids: ['1'] },
            { id: 'q2', correct_answer_ids: ['2'] },
          ],
          error: null,
        }),
      });

      // Mock insert
      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await ExamService.submitExamAnswersBatch(sessionId, mockAnswers);

      expect(result.saved).toBe(2);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            selected_answer_id: '1', // STRING, no UUID
          }),
          expect.objectContaining({
            selected_answer_id: '2', // STRING, no UUID
          }),
        ])
      );
    });

    it('should handle array of selected answers', async () => {
      const answersWithArrays = [
        { questionId: 'q1', selectedAnswerId: ['1', '2'], timeSpent: 30 },
      ];

      mockSingle.mockResolvedValueOnce({
        data: { user_id: 'user-123' },
        error: null,
      });

      mockSelect.mockReturnValueOnce({
        in: jest.fn().mockResolvedValue({
          data: [{ id: 'q1', correct_answer_ids: ['1', '2'] }],
          error: null,
        }),
      });

      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await ExamService.submitExamAnswersBatch(sessionId, answersWithArrays);

      expect(result.saved).toBe(1);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            selected_answer_id: '1', // First option
          }),
        ])
      );
    });

    it('should batch insert all answers in one operation', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { user_id: 'user-123' },
        error: null,
      });

      mockSelect.mockReturnValueOnce({
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'q1', correct_answer_ids: ['1'] },
            { id: 'q2', correct_answer_ids: ['2'] },
          ],
          error: null,
        }),
      });

      mockInsert.mockResolvedValueOnce({ error: null });

      await ExamService.submitExamAnswersBatch(sessionId, mockAnswers);

      // Verificar que se llama INSERT solo UNA vez con todos los datos
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
        expect.any(Object),
        expect.any(Object),
      ]));
    });
  });

  describe('completeExamSession', () => {
    const sessionId = 'test-session-id';

    it('should save score as INTEGER (not decimal)', async () => {
      // Mock session fetch
      mockSingle.mockResolvedValueOnce({
        data: {
          id: sessionId,
          user_id: 'user-123',
          total_questions: 8,
        },
        error: null,
      });

      // Mock answers fetch (5 correct out of 8 = 62.5%)
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({
          data: [
            { is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } },
            { is_correct: true, time_spent_seconds: 25, questions: { topic: 'Topic1' } },
            { is_correct: true, time_spent_seconds: 40, questions: { topic: 'Topic2' } },
            { is_correct: true, time_spent_seconds: 35, questions: { topic: 'Topic2' } },
            { is_correct: true, time_spent_seconds: 20, questions: { topic: 'Topic3' } },
            { is_correct: false, time_spent_seconds: 15, questions: { topic: 'Topic3' } },
            { is_correct: false, time_spent_seconds: 10, questions: { topic: 'Topic1' } },
            { is_correct: false, time_spent_seconds: 5, questions: { topic: 'Topic2' } },
          ],
          error: null,
        }),
      });

      // Mock update
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      // Mock upsert for user progress
      mockFrom.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await ExamService.completeExamSession(sessionId);

      // Verificar que el score es un INTEGER (redondeado)
      expect(Number.isInteger(result.score)).toBe(true);
      expect(result.score).toBe(63); // 5/8 * 100 = 62.5 → 63

      // Verificar que el update se llamó con score INTEGER
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          score: expect.any(Number),
        })
      );
    });

    it('should use correct column name: total_time_spent (not time_spent_seconds)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: sessionId,
          user_id: 'user-123',
          total_questions: 2,
        },
        error: null,
      });

      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({
          data: [
            { is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } },
            { is_correct: false, time_spent_seconds: 45, questions: { topic: 'Topic1' } },
          ],
          error: null,
        }),
      });

      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      await ExamService.completeExamSession(sessionId);

      // Verificar que se usa total_time_spent, NO time_spent_seconds
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          total_time_spent: 75, // 30 + 45
        })
      );
      expect(mockUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          time_spent_seconds: expect.any(Number),
        })
      );
    });

    it('should calculate score as percentage and determine pass/fail', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: sessionId,
          user_id: 'user-123',
          total_questions: 10,
        },
        error: null,
      });

      // 7 correct out of 10 = 70%
      const mockAnswersData = [
        ...Array(7).fill({ is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
        ...Array(3).fill({ is_correct: false, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
      ];

      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({
          data: mockAnswersData,
          error: null,
        }),
      });

      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await ExamService.completeExamSession(sessionId);

      expect(result.score).toBe(70);
      expect(result.passed).toBe(true); // 70% >= 65%
      expect(result.correctAnswers).toBe(7);
      expect(result.totalQuestions).toBe(10);
    });

    it('should mark exam as failed when score < 65%', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: sessionId,
          user_id: 'user-123',
          total_questions: 10,
        },
        error: null,
      });

      // 6 correct out of 10 = 60%
      const mockAnswersData = [
        ...Array(6).fill({ is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
        ...Array(4).fill({ is_correct: false, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
      ];

      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({
          data: mockAnswersData,
          error: null,
        }),
      });

      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await ExamService.completeExamSession(sessionId);

      expect(result.score).toBe(60);
      expect(result.passed).toBe(false); // 60% < 65%
    });
  });

  describe('createExamSession', () => {
    it('should store questions as JSONB array', async () => {
      const userId = 'user-123';
      const difficulty = 'medium';

      mockLimit.mockReturnValueOnce(
        Promise.resolve({
          data: [
            { id: 'q1', title: 'Question 1', difficulty: 'medium' },
            { id: 'q2', title: 'Question 2', difficulty: 'medium' },
          ],
          error: null,
        })
      );

      mockInsert.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({
            data: { id: 'session-123', questions: [] },
            error: null,
          }),
        }),
      });

      await ExamService.createExamSession(userId, difficulty, 2);

      // Verificar que questions se guarda como array JSONB
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: expect.arrayContaining([
            expect.objectContaining({ id: expect.any(String) }),
          ]),
        })
      );
    });
  });
});
