import { create } from 'zustand';
import { DailyStreak } from '@istqb-app/shared';
import { apiClient } from '@/lib/api';

interface StreakState {
  streak: DailyStreak | null;
  loading: boolean;
  error: string | null;
  loadStreak: () => Promise<void>;
  refreshStreak: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: null,
  loading: false,
  error: null,

  loadStreak: async () => {
    // Evitar cargar si ya está cargando
    if (get().loading) return;

    set({ loading: true, error: null });
    try {
      const response = await apiClient.getUserStreak();
      set({ streak: response.data.data, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading streak';
      console.error('Error loading streak:', error);
      set({ error: errorMessage, loading: false });
    }
  },

  refreshStreak: async () => {
    // Refrescar sin mostrar loading para mejor UX
    try {
      const response = await apiClient.getUserStreak();
      set({ streak: response.data.data });
    } catch (error) {
      console.error('Error refreshing streak:', error);
    }
  },
}));
