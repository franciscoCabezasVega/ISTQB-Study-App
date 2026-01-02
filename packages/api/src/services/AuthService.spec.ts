/**
 * Tests para AuthService
 * Cubre autenticación, registro y gestión de usuarios
 */

import { AuthService } from './AuthService';

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const { supabase } = require('../config/supabase');

describe('AuthService', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle, select: jest.fn().mockReturnValue({ single: mockSingle }) });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq, single: mockSingle });
    mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, select: mockSelect });
    mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });

    supabase.from = mockFrom;
    supabase.auth.getSession = jest.fn().mockResolvedValue({ data: null });
  });

  describe('signup', () => {
    const validSignupData = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    };

    const mockAuthUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    const mockUserData = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      language: 'es',
      theme: 'light',
    };

    it('should successfully register a new user', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: mockAuthUser,
          session: {
            access_token: 'token-123',
            refresh_token: 'refresh-123',
            expires_in: 3600,
          },
        },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const result = await AuthService.signup(
        validSignupData.email,
        validSignupData.password,
        validSignupData.fullName
      );

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: validSignupData.email,
        password: validSignupData.password,
      });
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalled();
      expect(result.user).toEqual(mockUserData);
      expect(result.session.access_token).toBe('token-123');
    });

    it('should throw error if email is missing', async () => {
      await expect(
        AuthService.signup('', 'password', 'Name')
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Email, password, and full name are required',
      });
    });

    it('should throw error if password is missing', async () => {
      await expect(
        AuthService.signup('test@example.com', '', 'Name')
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Email, password, and full name are required',
      });
    });

    it('should throw error if full name is missing', async () => {
      await expect(
        AuthService.signup('test@example.com', 'password', '')
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Email, password, and full name are required',
      });
    });

    it('should handle Supabase auth error', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      await expect(
        AuthService.signup(
          validSignupData.email,
          validSignupData.password,
          validSignupData.fullName
        )
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Email already registered',
      });
    });

    it('should handle user creation failure', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(
        AuthService.signup(
          validSignupData.email,
          validSignupData.password,
          validSignupData.fullName
        )
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to create user',
      });
    });

    it('should handle database error when creating user profile', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: mockAuthUser,
          session: { access_token: 'token' },
        },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        AuthService.signup(
          validSignupData.email,
          validSignupData.password,
          validSignupData.fullName
        )
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to create user profile',
      });
    });
  });

  describe('signin', () => {
    const mockAuthData = {
      user: { id: 'user-123', email: 'test@example.com' },
      session: {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_in: 3600,
      },
    };

    const mockUserData = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    it('should successfully sign in a user', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const result = await AuthService.signin('test@example.com', 'password');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.user).toEqual(mockUserData);
      expect(result.session.access_token).toBe('token-123');
    });

    it('should throw error for invalid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        AuthService.signin('test@example.com', 'wrongpassword')
      ).rejects.toEqual({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('should handle authentication failure when user is null', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(
        AuthService.signin('test@example.com', 'password')
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Authentication failed',
      });
    });

    it('should handle database error when fetching user data', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        AuthService.signin('test@example.com', 'password')
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to fetch user data',
      });
    });
  });

  describe('getCurrentUser', () => {
    const mockUserData = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    it('should get current user successfully', async () => {
      mockSingle.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const result = await AuthService.getCurrentUser('user-123');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual(mockUserData);
    });

    it('should throw error if user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(AuthService.getCurrentUser('invalid-id')).rejects.toEqual({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('updateUser', () => {
    const mockUpdatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Updated Name',
      language: 'en',
    };

    it('should update user successfully', async () => {
      mockSingle.mockResolvedValue({
        data: mockUpdatedUser,
        error: null,
      });

      const updates = { full_name: 'Updated Name', language: 'en' as const };
      const result = await AuthService.updateUser('user-123', updates);

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Updated Name',
          language: 'en',
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw error on update failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        AuthService.updateUser('user-123', { full_name: 'New Name' })
      ).rejects.toEqual({
        statusCode: 500,
        message: 'Failed to update user',
      });
    });
  });
});
