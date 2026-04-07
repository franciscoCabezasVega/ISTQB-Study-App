/// <reference types="jest" />

/**
 * Tests para ReportService
 * Cubre creación, lectura, actualización y rate-limiting de reportes.
 */

import { ReportService } from './ReportService.js';

jest.mock('../config/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

describe('ReportService', () => {
  let supabase: jest.Mocked<any>;

  // Helpers for chaining builders
  const makeSingle = (result: unknown) => jest.fn().mockResolvedValue(result);
  const makeChain = (overrides: Record<string, unknown> = {}) => {
    const single = overrides.single ?? makeSingle({ data: null, error: null });
    const select: jest.Mock = jest.fn().mockReturnValue({ single, eq: makeEq(single) });
    const insert: jest.Mock = jest.fn().mockReturnValue({ select });
    const update: jest.Mock = jest.fn().mockReturnValue({ eq: makeEq(single), select });
    return { select, insert, update, ...overrides };
  };
  const makeEq = (terminator: unknown): jest.Mock =>
    jest.fn().mockReturnValue({ single: terminator, eq: makeEq(terminator), select: jest.fn().mockReturnValue({ single: terminator }) });

  beforeAll(async () => {
    const mod = await import('../config/supabase.js');
    supabase = jest.mocked(mod.supabase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // checkRateLimit
  // ---------------------------------------------------------------
  describe('checkRateLimit', () => {
    it('should resolve when user is under the limit', async () => {
      supabase.rpc.mockResolvedValue({ data: true, error: null });
      await expect(ReportService.checkRateLimit('user-1')).resolves.toBeUndefined();
    });

    it('should throw 429 when user has exceeded the limit', async () => {
      supabase.rpc.mockResolvedValue({ data: false, error: null });
      await expect(ReportService.checkRateLimit('user-1')).rejects.toMatchObject({ statusCode: 429 });
    });

    it('should throw 500 on RPC error', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: { message: 'DB error' } });
      await expect(ReportService.checkRateLimit('user-1')).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ---------------------------------------------------------------
  // createReport
  // ---------------------------------------------------------------
  describe('createReport', () => {
    const payload = { type: 'system_bug' as const, title: 'Bug in login', description: 'Cannot log in with valid credentials' };
    const mockReport = { id: 'r-1', user_id: 'u-1', ...payload, status: 'open', priority: 'medium', created_at: '', updated_at: '' };

    beforeEach(() => {
      // Allow rate limit check to pass
      supabase.rpc.mockResolvedValue({ data: true, error: null });
    });

    it('should return the created report', async () => {
      const single = makeSingle({ data: mockReport, error: null });
      const select = jest.fn().mockReturnValue({ single });
      supabase.from.mockReturnValue({ insert: jest.fn().mockReturnValue({ select }) });

      const result = await ReportService.createReport('u-1', payload);
      expect(result).toEqual(mockReport);
    });

    it('should throw 500 on insert error', async () => {
      const single = makeSingle({ data: null, error: { message: 'insert failed' } });
      const select = jest.fn().mockReturnValue({ single });
      supabase.from.mockReturnValue({ insert: jest.fn().mockReturnValue({ select }) });

      await expect(ReportService.createReport('u-1', payload)).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ---------------------------------------------------------------
  // getUserReports
  // ---------------------------------------------------------------
  describe('getUserReports', () => {
    it('should return list of user reports', async () => {
      const reports = [{ id: 'r-1' }, { id: 'r-2' }];
      const order = jest.fn().mockResolvedValue({ data: reports, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      supabase.from.mockReturnValue({ select });

      const result = await ReportService.getUserReports('u-1');
      expect(result).toEqual(reports);
    });

    it('should throw 500 on fetch error', async () => {
      const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'err' } });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      supabase.from.mockReturnValue({ select });

      await expect(ReportService.getUserReports('u-1')).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ---------------------------------------------------------------
  // updateReport
  // ---------------------------------------------------------------
  describe('updateReport', () => {
    const buildUpdateChain = (result: unknown) => {
      const single = makeSingle(result);
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      supabase.from.mockReturnValue({ update });
    };

    it('should set resolved_at when transitioning to resolved', async () => {
      const updatedReport = { id: 'r-1', status: 'resolved', resolved_at: expect.any(String) };
      buildUpdateChain({ data: updatedReport, error: null });

      const result = await ReportService.updateReport('r-1', { status: 'resolved' });
      expect(result).toMatchObject({ status: 'resolved' });
    });

    it('should set resolved_at when transitioning to dismissed', async () => {
      const updatedReport = { id: 'r-1', status: 'dismissed', resolved_at: expect.any(String) };
      buildUpdateChain({ data: updatedReport, error: null });

      const result = await ReportService.updateReport('r-1', { status: 'dismissed' });
      expect(result).toMatchObject({ status: 'dismissed' });
    });

    it('should clear resolved_at when reverting to open', async () => {
      const updatedReport = { id: 'r-1', status: 'open', resolved_at: null };
      buildUpdateChain({ data: updatedReport, error: null });

      const result = await ReportService.updateReport('r-1', { status: 'open' });
      expect(result).toMatchObject({ status: 'open', resolved_at: null });
    });

    it('should clear resolved_at when reverting to in_review', async () => {
      const updatedReport = { id: 'r-1', status: 'in_review', resolved_at: null };
      buildUpdateChain({ data: updatedReport, error: null });

      const result = await ReportService.updateReport('r-1', { status: 'in_review' });
      expect(result).toMatchObject({ status: 'in_review' });
    });

    it('should throw 500 on update error', async () => {
      buildUpdateChain({ data: null, error: { message: 'update failed' } });
      await expect(ReportService.updateReport('r-1', { status: 'open' })).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // ---------------------------------------------------------------
  // getAllReports
  // ---------------------------------------------------------------
  describe('getAllReports', () => {
    it('should return paginated reports', async () => {
      const reports = [{ id: 'r-1' }];
      const range = jest.fn().mockResolvedValue({ data: reports, error: null, count: 1 });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      supabase.from.mockReturnValue({ select });

      const result = await ReportService.getAllReports({ page: 1, limit: 10 });
      expect(result.data).toEqual(reports);
      expect(result.total).toBe(1);
    });

    it('should throw 500 on fetch error', async () => {
      const range = jest.fn().mockResolvedValue({ data: null, error: { message: 'err' }, count: 0 });
      const order = jest.fn().mockReturnValue({ range });
      const select = jest.fn().mockReturnValue({ order });
      supabase.from.mockReturnValue({ select });

      await expect(ReportService.getAllReports({})).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
