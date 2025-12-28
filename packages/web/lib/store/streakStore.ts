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
    } catch (error: any) {
      console.error('Error loading streak:', error);
      set({ error: error.message || 'Error loading streak', loading: false });
    }
  },

  refreshStreak: async () => {
    // Refrescar sin mostrar loading para mejor UX
    try {
      const response = await apiClient.getUserStreak();
      set({ streak: response.data.data });
    } catch (error: any) {
      console.error('Error refreshing streak:', error);
    }
  },
}));
