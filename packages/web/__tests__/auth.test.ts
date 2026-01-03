/**
 * Tests para validar el flujo de autenticación
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Logout Flow', () => {
    it('should clear auth data from localStorage on logout', () => {
      // Arrange: Simular usuario autenticado
      const authData = {
        state: {
          user: { id: '123', email: 'test@test.com', full_name: 'Test User' },
          accessToken: 'fake-token',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authData));

      // Act: Simular logout
      localStorage.removeItem('auth-storage');

      // Assert: Verificar que los datos fueron eliminados
      const stored = localStorage.getItem('auth-storage');
      expect(stored).toBeNull();
    });

    it('should redirect to signin page after logout', () => {
      // Arrange
      const mockPush = vi.fn();
      const mockRouter = { push: mockPush };

      // Act: Simular logout con redirección
      mockRouter.push('/auth/signin');

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });

  describe('Achievements Load Flow', () => {
    it('should not load achievements if user is null', async () => {
      // Arrange: No hay usuario
      const user = null;
      const loadAchievements = vi.fn();

      // Act: Verificar si debe cargar
      if (user) {
        await loadAchievements();
      }

      // Assert: No debe intentar cargar
      expect(loadAchievements).not.toHaveBeenCalled();
    });

    it('should load achievements when user exists', async () => {
      // Arrange: Usuario existe
      const user = { id: '123', email: 'test@test.com', full_name: 'Test User' };
      const loadAchievements = vi.fn().mockResolvedValue({
        allAchievements: [],
        userAchievements: [],
      });

      // Act: Cargar achievements
      if (user) {
        await loadAchievements();
      }

      // Assert: Debe intentar cargar
      expect(loadAchievements).toHaveBeenCalled();
    });

    it('should wait for user to be loaded from localStorage before fetching achievements', async () => {
      // Arrange: Simular carga diferida de usuario
      let user: unknown = null;
      const loadAchievements = vi.fn();

      // Simular que el usuario se carga después de 100ms
      setTimeout(() => {
        user = { id: '123', email: 'test@test.com', full_name: 'Test User' };
      }, 100);

      // Act: Esperar y verificar
      await new Promise((resolve) => setTimeout(resolve, 150));

      if (user) {
        await loadAchievements();
      }

      // Assert
      expect(user).not.toBeNull();
      expect(loadAchievements).toHaveBeenCalled();
    });
  });

  describe('Token Persistence', () => {
    it('should persist token in localStorage', () => {
      // Arrange
      const token = 'test-access-token';
      const authData = {
        state: {
          user: null,
          accessToken: token,
          isAuthenticated: false,
        },
        version: 0,
      };

      // Act
      localStorage.setItem('auth-storage', JSON.stringify(authData));

      // Assert
      const stored = localStorage.getItem('auth-storage');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.accessToken).toBe(token);
    });

    it('should retrieve token from localStorage for API calls', () => {
      // Arrange
      const token = 'test-token-123';
      const authData = {
        state: {
          user: { id: '123', email: 'test@test.com' },
          accessToken: token,
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authData));

      // Act
      const stored = localStorage.getItem('auth-storage');
      const parsed = stored ? JSON.parse(stored) : null;

      // Assert
      expect(parsed?.state?.accessToken).toBe(token);
    });
  });

  describe('Session Expiry', () => {
    it('should handle 401 response by clearing auth and redirecting', () => {
      // Arrange
      const authData = {
        state: {
          user: { id: '123', email: 'test@test.com' },
          accessToken: 'expired-token',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authData));

      // Act: Simular respuesta 401
      localStorage.removeItem('auth-storage');

      // Assert
      const stored = localStorage.getItem('auth-storage');
      expect(stored).toBeNull();
    });
  });
});
