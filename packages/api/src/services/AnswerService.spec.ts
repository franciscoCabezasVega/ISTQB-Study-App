/**
 * Tests para AnswerService
 * Cubre estadísticas y tasas de éxito del usuario
 */

import { AnswerService } from './AnswerService';

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');

describe('AnswerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSuccessRate', () => {
    it('should return success rate for valid user', async () => {
      supabase.rpc.mockResolvedValue({
        data: 85.5,
        error: null,
      });

      const result = await AnswerService.getSuccessRate('user-123');

      expect(supabase.rpc).toHaveBeenCalledWith('get_combined_user_success_rate', {
        p_user_id: 'user-123',
      });
      expect(result).toBe(85.5);
    });

    it('should return 0 if user has no answers', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await AnswerService.getSuccessRate('user-456');

      expect(result).toBe(0);
    });

    it('should return 0 on database error', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await AnswerService.getSuccessRate('user-123');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching success rate:',
        { message: 'Database error' }
      );
      expect(result).toBe(0);
    });

    it('should handle 0% success rate correctly', async () => {
      supabase.rpc.mockResolvedValue({
        data: 0,
        error: null,
      });

      const result = await AnswerService.getSuccessRate('user-789');

      expect(result).toBe(0);
    });

    it('should handle 100% success rate correctly', async () => {
      supabase.rpc.mockResolvedValue({
        data: 100,
        error: null,
      });

      const result = await AnswerService.getSuccessRate('user-perfect');

      expect(result).toBe(100);
    });
  });

  describe('getStatisticsByTopic', () => {
    const mockStatistics = [
      {
        topic: 'Fundamentals of Testing',
        total_answers: 50,
        correct_answers: 42,
        success_rate: 84,
      },
      {
        topic: 'Test Analysis and Design',
        total_answers: 30,
        correct_answers: 24,
        success_rate: 80,
      },
    ];

    it('should return statistics by topic for valid user', async () => {
      supabase.rpc.mockResolvedValue({
        data: mockStatistics,
        error: null,
      });

      const result = await AnswerService.getStatisticsByTopic('user-123');

      expect(supabase.rpc).toHaveBeenCalledWith('get_combined_user_statistics_by_topic', {
        p_user_id: 'user-123',
      });
      expect(result).toEqual(mockStatistics);
    });

    it('should return empty array if user has no statistics', async () => {
      supabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await AnswerService.getStatisticsByTopic('user-new');

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'Function not found',
          details: 'RPC function does not exist',
          hint: 'Create the function first',
          code: '42883',
        },
      });

      await expect(AnswerService.getStatisticsByTopic('user-123')).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to fetch statistics',
        details: 'Function not found',
        hint: 'Create the function first',
      });

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle null data gracefully', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await AnswerService.getStatisticsByTopic('user-empty');

      expect(result).toBeNull();
    });
  });

  describe('getExamStatistics', () => {
    const mockExamStats = {
      total_exams: 5,
      average_score: 82.4,
      passed_exams: 4,
      failed_exams: 1,
      best_score: 95,
      worst_score: 62.5,
    };

    it('should return exam statistics for valid user', async () => {
      supabase.rpc.mockResolvedValue({
        data: [mockExamStats],
        error: null,
      });

      const result = await AnswerService.getExamStatistics('user-123');

      expect(supabase.rpc).toHaveBeenCalledWith('get_exam_statistics', {
        p_user_id: 'user-123',
      });
      expect(result).toEqual(mockExamStats);
    });

    it('should return default values if user has no exams', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await AnswerService.getExamStatistics('user-no-exams');

      expect(result).toEqual({
        total_exams: 0,
        average_score: 0,
        last_score: 0,
        highest_score: 0,
        exams_passed: 0,
        last_exam_date: null,
      });
    });

    it('should return default values if data array is empty', async () => {
      supabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await AnswerService.getExamStatistics('user-new');

      expect(result).toEqual({
        total_exams: 0,
        average_score: 0,
        last_score: 0,
        highest_score: 0,
        exams_passed: 0,
        last_exam_date: null,
      });
    });

    it('should throw error on database failure', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'Permission denied',
          details: 'User lacks privileges',
          hint: 'Grant execute permissions',
          code: '42501',
        },
      });

      await expect(AnswerService.getExamStatistics('user-123')).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to fetch exam statistics',
        details: 'Permission denied',
        hint: 'Grant execute permissions',
      });

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle user with 1 exam correctly', async () => {
      const singleExamStats = {
        total_exams: 1,
        average_score: 90,
        passed_exams: 1,
        failed_exams: 0,
        best_score: 90,
        worst_score: 90,
      };

      supabase.rpc.mockResolvedValue({
        data: [singleExamStats],
        error: null,
      });

      const result = await AnswerService.getExamStatistics('user-single');

      expect(result).toEqual(singleExamStats);
    });
  });
});
