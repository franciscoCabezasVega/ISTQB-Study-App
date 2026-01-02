/**
 * Tests para QuestionService
 * Cubre obtención de preguntas por tema y filtros
 */

import { QuestionService } from '../services/QuestionService';

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');

describe('QuestionService', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLimit = jest.fn();
    mockEq = jest.fn().mockReturnValue({ limit: mockLimit });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq, limit: mockLimit, single: jest.fn() });
    mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    supabase.from = mockFrom;
  });

  describe('getQuestionsByTopic', () => {
    const mockQuestionsFromDB = [
      {
        id: 'q1',
        topic: 'Fundamentals of Testing',
        title_en: 'What is testing?',
        title_es: '¿Qué es testing?',
        options_en: [
          { id: '1', text: 'Option 1' },
          { id: '2', text: 'Option 2' },
        ],
        options_es: [
          { id: '1', text: 'Opción 1' },
          { id: '2', text: 'Opción 2' },
        ],
        correct_answer_ids: ['1'],
      },
      {
        id: 'q2',
        topic: 'Fundamentals of Testing',
        title_en: 'Define bug',
        title_es: 'Define bug',
        options_en: [
          { id: '3', text: 'Option 3' },
          { id: '4', text: 'Option 4' },
        ],
        options_es: [
          { id: '3', text: 'Opción 3' },
          { id: '4', text: 'Opción 4' },
        ],
        correct_answer_ids: ['3'],
      },
    ];

    it('should return questions for a specific topic', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsFromDB,
        error: null,
      });

      const result = await QuestionService.getQuestionsByTopic(
        'Fundamentals of Testing',
        'en',
        10
      );

      expect(mockFrom).toHaveBeenCalledWith('questions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('topic', 'Fundamentals of Testing');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'q1',
        topic: 'Fundamentals of Testing',
        title: 'What is testing?',
        options: [
          { id: '1', text: 'Option 1' },
          { id: '2', text: 'Option 2' },
        ],
      });
    });

    it('should handle empty results', async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await QuestionService.getQuestionsByTopic(
        'Unknown Topic',
        'en',
        10
      );

      expect(result).toEqual([]);
    });

    it('should throw error on database error', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        QuestionService.getQuestionsByTopic('Fundamentals of Testing', 'en', 10)
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to fetch questions',
      });
    });

    it('should use default limit of 10 when not specified', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsFromDB,
        error: null,
      });

      await QuestionService.getQuestionsByTopic('Fundamentals of Testing', 'en');

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should respect custom limit parameter', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsFromDB.slice(0, 1),
        error: null,
      });

      await QuestionService.getQuestionsByTopic('Fundamentals of Testing', 'en', 5);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });

  describe('getRandomQuestions', () => {
    const mockQuestionsDB = Array.from({ length: 50 }, (_, i) => ({
      id: `q${i + 1}`,
      topic: 'Fundamentals of Testing',
      title_en: `Question ${i + 1}`,
      title_es: `Pregunta ${i + 1}`,
      options_en: [
        { id: '1', text: 'Option 1' },
        { id: '2', text: 'Option 2' },
      ],
      options_es: [
        { id: '1', text: 'Opción 1' },
        { id: '2', text: 'Opción 2' },
      ],
      correct_answer_ids: ['1'],
    }));

    it('should return random questions with default count of 40', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsDB,
        error: null,
      });

      const result = await QuestionService.getRandomQuestions();

      expect(mockFrom).toHaveBeenCalledWith('questions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockLimit).toHaveBeenCalledWith(40);
      expect(result).toHaveLength(40);
    });

    it('should respect custom count parameter', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsDB.slice(0, 10),
        error: null,
      });

      const result = await QuestionService.getRandomQuestions(10);

      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should format questions in English when specified', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsDB.slice(0, 5),
        error: null,
      });

      const result = await QuestionService.getRandomQuestions(5, 'en');

      expect(result[0].title).toContain('Question');
      expect(result[0].options[0].text).toBe('Option 1');
    });

    it('should format questions in Spanish by default', async () => {
      mockLimit.mockResolvedValue({
        data: mockQuestionsDB.slice(0, 5),
        error: null,
      });

      const result = await QuestionService.getRandomQuestions(5);

      expect(result[0].title).toContain('Pregunta');
      expect(result[0].options[0].text).toBe('Opción 1');
    });

    it('should shuffle and slice questions correctly', async () => {
      const limitedQuestions = mockQuestionsDB.slice(0, 45);
      mockLimit.mockResolvedValue({
        data: limitedQuestions,
        error: null,
      });

      const result = await QuestionService.getRandomQuestions(40);

      expect(result).toHaveLength(40);
      // Verify all results have required properties
      result.forEach(q => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('title');
        expect(q).toHaveProperty('options');
      });
    });

    it('should throw error on database failure', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(QuestionService.getRandomQuestions(40)).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to fetch questions',
      });
    });
  });
});
