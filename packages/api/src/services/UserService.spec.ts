/**
 * Tests para UserService  
 * Cubre gestión de perfil de usuario y preferencias
 */

import UserService from './UserService';

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');

describe('UserService', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ 
      single: mockSingle,
      select: jest.fn().mockReturnValue({ single: mockSingle }),
    });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, select: mockSelect });
    
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });

    supabase.from = mockFrom;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserProfile', () => {
    const mockUserData = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      language: 'es',
      theme: 'light',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    };

    it('should return user profile for valid user', async () => {
      mockSingle.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const result = await UserService.getUserProfile('user-123');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual(mockUserData);
    });

    it('should return null if user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await UserService.getUserProfile('invalid-user');

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'ERROR', message: 'Database error' },
      });

      await expect(UserService.getUserProfile('user-123')).rejects.toThrow(
        'Error fetching user profile: Database error'
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('should use default language if not set', async () => {
      const userWithoutLanguage = { ...mockUserData, language: null };
      mockSingle.mockResolvedValue({
        data: userWithoutLanguage,
        error: null,
      });

      const result = await UserService.getUserProfile('user-123');

      expect(result?.language).toBe('es');
    });

    it('should use default theme if not set', async () => {
      const userWithoutTheme = { ...mockUserData, theme: null };
      mockSingle.mockResolvedValue({
        data: userWithoutTheme,
        error: null,
      });

      const result = await UserService.getUserProfile('user-123');

      expect(result?.theme).toBe('light');
    });
  });

  describe('updateLanguagePreference', () => {
    const mockUpdatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      language: 'en',
      theme: 'light',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T12:00:00Z',
    };

    it('should update language preference to English', async () => {
      mockSingle.mockResolvedValue({
        data: mockUpdatedUser,
        error: null,
      });

      const result = await UserService.updateLanguagePreference('user-123', 'en');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'en',
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result.language).toBe('en');
    });

    it('should update language preference to Spanish', async () => {
      const spanishUser = { ...mockUpdatedUser, language: 'es' };
      mockSingle.mockResolvedValue({
        data: spanishUser,
        error: null,
      });

      const result = await UserService.updateLanguagePreference('user-123', 'es');

      expect(result.language).toBe('es');
    });

    it('should throw error on update failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        UserService.updateLanguagePreference('user-123', 'en')
      ).rejects.toThrow('Error updating language preference: Update failed');
    });
  });
});
