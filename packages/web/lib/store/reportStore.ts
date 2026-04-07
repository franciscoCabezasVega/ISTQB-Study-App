import { create } from 'zustand';
import { UserReport, CreateReportPayload } from '@istqb-app/shared';
import { apiClient } from '../api';

interface ReportState {
  // Modal state
  isModalOpen: boolean;
  prefillType: CreateReportPayload['type'] | null;
  prefillQuestionId: string | null;
  prefillPageUrl: string | null;

  // User reports list
  userReports: UserReport[];
  isLoadingReports: boolean;

  // Actions
  openReportModal: (opts?: {
    type?: CreateReportPayload['type'];
    questionId?: string;
    pageUrl?: string;
  }) => void;
  closeReportModal: () => void;
  submitReport: (payload: CreateReportPayload) => Promise<void>;
  fetchUserReports: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  isModalOpen: false,
  prefillType: null,
  prefillQuestionId: null,
  prefillPageUrl: null,
  userReports: [],
  isLoadingReports: false,

  openReportModal: (opts) => {
    set({
      isModalOpen: true,
      prefillType: opts?.type || null,
      prefillQuestionId: opts?.questionId || null,
      prefillPageUrl: opts?.pageUrl || (typeof window !== 'undefined' ? window.location.href : null),
    });
  },

  closeReportModal: () => {
    set({
      isModalOpen: false,
      prefillType: null,
      prefillQuestionId: null,
      prefillPageUrl: null,
    });
  },

  submitReport: async (payload) => {
    await apiClient.createReport(payload);
    // Refrescar lista si ya estaba cargada
    if (get().userReports.length > 0) {
      await get().fetchUserReports();
    }
  },

  fetchUserReports: async () => {
    set({ isLoadingReports: true });
    try {
      const response = await apiClient.getUserReports();
      set({ userReports: response.data.data || [] });
    } catch (error) {
      console.error('Error fetching user reports:', error);
      set({ userReports: [] });
    } finally {
      set({ isLoadingReports: false });
    }
  },
}));
