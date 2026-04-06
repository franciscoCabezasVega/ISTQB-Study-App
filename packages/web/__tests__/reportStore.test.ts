/**
 * Tests para useReportStore (Zustand)
 * Cubre apertura/cierre del modal, submit de reporte y carga de lista.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AxiosResponse } from 'axios';

// Mock del cliente API antes de importar el store
vi.mock('@/lib/api', () => ({
  apiClient: {
    createReport: vi.fn(),
    getUserReports: vi.fn(),
  },
}));

import { useReportStore } from '@/lib/store/reportStore';
import { apiClient } from '@/lib/api';
import type { UserReport } from '@istqb-app/shared';

const mockCreateReport = vi.mocked(apiClient.createReport);
const mockGetUserReports = vi.mocked(apiClient.getUserReports);

/** Construye un AxiosResponse mínimo para los mocks */
const axiosOk = <T>(data: T): AxiosResponse<T> =>
  ({ data, status: 200, statusText: 'OK', headers: {}, config: {} as AxiosResponse['config'] }) as AxiosResponse<T>;

describe('useReportStore', () => {
  beforeEach(() => {
    // Reset Zustand store to initial state
    useReportStore.setState({
      isModalOpen: false,
      prefillType: null,
      prefillQuestionId: null,
      prefillPageUrl: null,
      userReports: [],
      isLoadingReports: false,
    });
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // openReportModal / closeReportModal
  // ---------------------------------------------------------------
  describe('openReportModal', () => {
    it('should open with no prefill by default', () => {
      useReportStore.getState().openReportModal();
      const state = useReportStore.getState();
      expect(state.isModalOpen).toBe(true);
      expect(state.prefillType).toBeNull();
      expect(state.prefillQuestionId).toBeNull();
    });

    it('should set prefill values when provided', () => {
      useReportStore.getState().openReportModal({
        type: 'question_error',
        questionId: 'q-123',
        pageUrl: 'http://localhost/study',
      });
      const state = useReportStore.getState();
      expect(state.isModalOpen).toBe(true);
      expect(state.prefillType).toBe('question_error');
      expect(state.prefillQuestionId).toBe('q-123');
      expect(state.prefillPageUrl).toBe('http://localhost/study');
    });
  });

  describe('closeReportModal', () => {
    it('should close the modal and clear prefill state', () => {
      useReportStore.setState({
        isModalOpen: true,
        prefillType: 'system_bug',
        prefillQuestionId: 'q-1',
        prefillPageUrl: 'http://localhost',
      });
      useReportStore.getState().closeReportModal();
      const state = useReportStore.getState();
      expect(state.isModalOpen).toBe(false);
      expect(state.prefillType).toBeNull();
      expect(state.prefillQuestionId).toBeNull();
      expect(state.prefillPageUrl).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // submitReport
  // ---------------------------------------------------------------
  describe('submitReport', () => {
    const payload = {
      type: 'system_bug' as const,
      title: 'Login broken',
      description: 'Cannot log in with valid credentials',
    };

    it('should call apiClient.createReport with the payload', async () => {
      mockCreateReport.mockResolvedValue(axiosOk({ id: 'r-1' }));
      await useReportStore.getState().submitReport(payload);
      expect(mockCreateReport).toHaveBeenCalledWith(payload);
    });

    it('should refresh userReports list when reports are already loaded', async () => {
      // Pre-populate store so the refresh branch is exercised
      useReportStore.setState({ userReports: [{ id: 'old-r' } as UserReport] });

      mockCreateReport.mockResolvedValue(axiosOk({ id: 'r-2' }));
      const refreshedReports = [{ id: 'old-r' }, { id: 'r-2' }];
      mockGetUserReports.mockResolvedValue(axiosOk({ data: refreshedReports }));

      await useReportStore.getState().submitReport(payload);

      expect(mockGetUserReports).toHaveBeenCalled();
      expect(useReportStore.getState().userReports).toEqual(refreshedReports);
    });

    it('should NOT call getUserReports when report list is empty', async () => {
      mockCreateReport.mockResolvedValue(axiosOk({ id: 'r-3' }));
      await useReportStore.getState().submitReport(payload);
      expect(mockGetUserReports).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by createReport', async () => {
      mockCreateReport.mockRejectedValue(new Error('Network error'));
      await expect(useReportStore.getState().submitReport(payload)).rejects.toThrow('Network error');
    });
  });

  // ---------------------------------------------------------------
  // fetchUserReports
  // ---------------------------------------------------------------
  describe('fetchUserReports', () => {
    it('should populate userReports on success', async () => {
      const reports = [{ id: 'r-1' }, { id: 'r-2' }];
      mockGetUserReports.mockResolvedValue(axiosOk({ data: reports }));

      await useReportStore.getState().fetchUserReports();

      const state = useReportStore.getState();
      expect(state.userReports).toEqual(reports);
      expect(state.isLoadingReports).toBe(false);
    });

    it('should set userReports to [] on error', async () => {
      mockGetUserReports.mockRejectedValue(new Error('Server error'));

      await useReportStore.getState().fetchUserReports();

      const state = useReportStore.getState();
      expect(state.userReports).toEqual([]);
      expect(state.isLoadingReports).toBe(false);
    });

    it('should set isLoadingReports true while fetching then false when done', async () => {
      let resolveFetch!: (v: AxiosResponse) => void;
      mockGetUserReports.mockReturnValue(new Promise<AxiosResponse>((r) => (resolveFetch = r)));

      const promise = useReportStore.getState().fetchUserReports();
      expect(useReportStore.getState().isLoadingReports).toBe(true);

      resolveFetch(axiosOk({ data: [] }));
      await promise;

      expect(useReportStore.getState().isLoadingReports).toBe(false);
    });
  });
});
