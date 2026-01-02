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

// Mock de QuestionService
jest.mock('../services/QuestionService', () => ({
  QuestionService: {
    getQuestionsByTopic: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');
const { QuestionService } = require('../services/QuestionService');

describe('ExamService', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockUpsert: jest.Mock;
  let mockEq: jest.Mock;
  let mockIn: jest.Mock;
  let mockSingle: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock chain para diferentes casos
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    mockIn = jest.fn().mockResolvedValue({ data: [], error: null });
    mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });
    mockSelect = jest.fn().mockReturnValue({ 
      eq: mockEq, 
      in: mockIn,
      limit: mockLimit,
      single: mockSingle,
    });
    mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
    mockUpdate = jest.fn().mockReturnValue({ 
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    });
    mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });
    
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      upsert: mockUpsert,
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
      mockIn.mockResolvedValueOnce({
        data: [
          { id: 'q1', correct_answer_ids: ['1'] },
          { id: 'q2', correct_answer_ids: ['2'] },
        ],
        error: null,
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

      mockIn.mockResolvedValueOnce({
        data: [{ id: 'q1', correct_answer_ids: ['1', '2'] }],
        error: null,
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

      mockIn.mockResolvedValueOnce({
        data: [
          { id: 'q1', correct_answer_ids: ['1'] },
          { id: 'q2', correct_answer_ids: ['2'] },
        ],
        error: null,
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

    beforeEach(() => {
      // Mock para user_progress queries
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
            upsert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
          upsert: mockUpsert,
          eq: mockEq,
        };
      });
    });

    it('should save score as INTEGER (not decimal)', async () => {
      // Mock session fetch - primera llamada a from('exam_sessions')
      const mockSessionEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: sessionId,
            user_id: 'user-123',
            total_questions: 8,
          },
          error: null,
        }),
      });

      const mockSessionSelect = jest.fn().mockReturnValue({
        eq: mockSessionEq,
      });

      // Mock answers fetch - segunda llamada a from('exam_answers')
      const mockAnswersEq = jest.fn().mockResolvedValue({
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
      });

      const mockAnswersSelect = jest.fn().mockReturnValue({
        eq: mockAnswersEq,
      });

      // Mock update - tercera llamada a from('exam_sessions')
      const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateCall = jest.fn().mockReturnValue({
        eq: mockUpdateEq,
      });

      // Configurar from para retornar diferentes mocks según el orden de llamadas
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'exam_sessions') {
          callCount++;
          if (callCount === 1) {
            return { select: mockSessionSelect };
          } else {
            return { update: mockUpdateCall };
          }
        }
        if (table === 'exam_answers') {
          return { select: mockAnswersSelect };
        }
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return { select: mockSelect, insert: mockInsert, update: mockUpdate };
      });

      const result = await ExamService.completeExamSession(sessionId);

      // Verificar que el score es un INTEGER (redondeado)
      expect(Number.isInteger(result.score)).toBe(true);
      expect(result.score).toBe(63); // 5/8 * 100 = 62.5 → 63
      expect(result.correctAnswers).toBe(5);
      expect(result.totalQuestions).toBe(8);

      // Verificar que el update se llamó con score INTEGER
      expect(mockUpdateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 63,
          total_time_spent: 180,
          status: 'completed',
        })
      );
    });

    it('should use correct column name: total_time_spent (not time_spent_seconds)', async () => {
      // Mock session fetch
      const mockSessionEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: sessionId,
            user_id: 'user-123',
            total_questions: 2,
          },
          error: null,
        }),
      });

      const mockSessionSelect = jest.fn().mockReturnValue({
        eq: mockSessionEq,
      });

      // Mock answers fetch
      const mockAnswersEq = jest.fn().mockResolvedValue({
        data: [
          { is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } },
          { is_correct: false, time_spent_seconds: 45, questions: { topic: 'Topic1' } },
        ],
        error: null,
      });

      const mockAnswersSelect = jest.fn().mockReturnValue({
        eq: mockAnswersEq,
      });

      // Mock update
      const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateCall = jest.fn().mockReturnValue({
        eq: mockUpdateEq,
      });

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'exam_sessions') {
          callCount++;
          if (callCount === 1) {
            return { select: mockSessionSelect };
          } else {
            return { update: mockUpdateCall };
          }
        }
        if (table === 'exam_answers') {
          return { select: mockAnswersSelect };
        }
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return { select: mockSelect, insert: mockInsert, update: mockUpdate };
      });

      await ExamService.completeExamSession(sessionId);

      // Verificar que se usa total_time_spent, NO time_spent_seconds
      expect(mockUpdateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          total_time_spent: 75, // 30 + 45
        })
      );
      expect(mockUpdateCall).not.toHaveBeenCalledWith(
        expect.objectContaining({
          time_spent_seconds: expect.any(Number),
        })
      );
    });

    it('should calculate score as percentage and determine pass/fail', async () => {
      // Mock session fetch
      const mockSessionEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: sessionId,
            user_id: 'user-123',
            total_questions: 10,
          },
          error: null,
        }),
      });

      const mockSessionSelect = jest.fn().mockReturnValue({
        eq: mockSessionEq,
      });

      // 7 correct out of 10 = 70%
      const mockAnswersData = [
        ...Array(7).fill({ is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
        ...Array(3).fill({ is_correct: false, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
      ];

      const mockAnswersEq = jest.fn().mockResolvedValue({
        data: mockAnswersData,
        error: null,
      });

      const mockAnswersSelect = jest.fn().mockReturnValue({
        eq: mockAnswersEq,
      });

      // Mock update
      const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateCall = jest.fn().mockReturnValue({
        eq: mockUpdateEq,
      });

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'exam_sessions') {
          callCount++;
          if (callCount === 1) {
            return { select: mockSessionSelect };
          } else {
            return { update: mockUpdateCall };
          }
        }
        if (table === 'exam_answers') {
          return { select: mockAnswersSelect };
        }
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return { select: mockSelect, insert: mockInsert, update: mockUpdate };
      });

      const result = await ExamService.completeExamSession(sessionId);

      expect(result.score).toBe(70);
      expect(result.passed).toBe(true); // 70% >= 65%
      expect(result.correctAnswers).toBe(7);
      expect(result.totalQuestions).toBe(10);
    });

    it('should mark exam as failed when score < 65%', async () => {
      // Mock session fetch
      const mockSessionEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: sessionId,
            user_id: 'user-123',
            total_questions: 10,
          },
          error: null,
        }),
      });

      const mockSessionSelect = jest.fn().mockReturnValue({
        eq: mockSessionEq,
      });

      // 6 correct out of 10 = 60%
      const mockAnswersData = [
        ...Array(6).fill({ is_correct: true, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
        ...Array(4).fill({ is_correct: false, time_spent_seconds: 30, questions: { topic: 'Topic1' } }),
      ];

      const mockAnswersEq = jest.fn().mockResolvedValue({
        data: mockAnswersData,
        error: null,
      });

      const mockAnswersSelect = jest.fn().mockReturnValue({
        eq: mockAnswersEq,
      });

      // Mock update
      const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateCall = jest.fn().mockReturnValue({
        eq: mockUpdateEq,
      });

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'exam_sessions') {
          callCount++;
          if (callCount === 1) {
            return { select: mockSessionSelect };
          } else {
            return { update: mockUpdateCall };
          }
        }
        if (table === 'exam_answers') {
          return { select: mockAnswersSelect };
        }
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return { select: mockSelect, insert: mockInsert, update: mockUpdate };
      });

      const result = await ExamService.completeExamSession(sessionId);

      expect(result.score).toBe(60);
      expect(result.passed).toBe(false); // 60% < 65%
    });
  });

  describe('createExamSession', () => {
    it('should store questions as JSONB array', async () => {
      const userId = 'user-123';

      // Mock getUserLanguage - primera llamada a from('users')
      const mockUserEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { language: 'en' },
          error: null,
        }),
      });

      const mockUserSelect = jest.fn().mockReturnValue({
        eq: mockUserEq,
      });

      // Mock getQuestionsByTopic - retornar algunas preguntas
      (QuestionService.getQuestionsByTopic as jest.Mock).mockResolvedValue([
        { id: 'q1', title: 'Question 1', topic: 'Fundamentals of Testing' },
        { id: 'q2', title: 'Question 2', topic: 'Fundamentals of Testing' },
      ]);

      // Mock session insert - última llamada a from('exam_sessions')
      const mockInsertSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'session-123',
            user_id: userId,
            total_questions: 12,
            questions: [{ id: 'q1', title: 'Question 1' }],
            started_at: new Date().toISOString(),
            status: 'in_progress',
          },
          error: null,
        }),
      });

      const mockInsertCall = jest.fn().mockReturnValue({
        select: mockInsertSelect,
      });

      // Configurar from para retornar diferentes mocks según la tabla
      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        if (table === 'exam_sessions') {
          return { insert: mockInsertCall };
        }
        return { select: mockSelect, insert: mockInsert, update: mockUpdate };
      });

      const result = await ExamService.createExamSession(userId, 40);

      // Verificar que questions se guarda como array JSONB
      expect(mockInsertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
            }),
          ]),
          status: 'in_progress',
        })
      );

      expect(result.sessionId).toBe('session-123');
      expect(result.questions).toBeDefined();
      expect(Array.isArray(result.questions)).toBe(true);
    });
  });
});
