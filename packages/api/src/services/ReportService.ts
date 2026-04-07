import { supabase } from '../config/supabase.js';
import {
  UserReport,
  CreateReportPayload,
  UpdateReportPayload,
  ReportStats,
  ReportType,
} from '@istqb-app/shared';

export class ReportService {
  /**
   * Verifica el rate limit: máximo 10 reportes por usuario por hora
   */
  static async checkRateLimit(userId: string): Promise<void> {
    const { data, error } = await supabase.rpc('check_report_rate_limit', {
      p_user_id: userId,
    });

    if (error) {
      throw { statusCode: 500, message: 'Error checking rate limit' };
    }

    if (!data) {
      throw { statusCode: 429, message: 'Too many reports. Please wait before submitting another report.' };
    }
  }

  /**
   * Crea un nuevo reporte de usuario
   */
  static async createReport(userId: string, payload: CreateReportPayload): Promise<UserReport> {
    await this.checkRateLimit(userId);

    const { data, error } = await supabase
      .from('user_reports')
      .insert({
        user_id: userId,
        type: payload.type,
        title: payload.title.trim(),
        description: payload.description.trim(),
        question_id: payload.question_id || null,
        page_url: payload.page_url || null,
      })
      .select()
      .single();

    if (error) {
      throw { statusCode: 500, message: 'Failed to create report' };
    }

    return data as UserReport;
  }

  /**
   * Obtiene los reportes de un usuario
   */
  static async getUserReports(userId: string): Promise<UserReport[]> {
    const { data, error } = await supabase
      .from('user_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch reports' };
    }

    return data as UserReport[];
  }

  /**
   * Obtiene un reporte específico de un usuario (verificando que le pertenece)
   */
  static async getUserReportById(userId: string, reportId: string): Promise<UserReport> {
    const { data, error } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw { statusCode: 404, message: 'Report not found' };
    }

    return data as UserReport;
  }

  // ============================================================
  // Endpoints de Administración (service_role bypasea RLS)
  // ============================================================

  /**
   * Obtiene todos los reportes con filtros (solo admin)
   */
  static async getAllReports(filters: {
    status?: string;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: UserReport[]; total: number }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_reports')
      .select('*, users:user_id(email, full_name)', { count: 'exact' });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.priority) query = query.eq('priority', filters.priority);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch reports' };
    }

    return { data: data as UserReport[], total: count || 0 };
  }

  /**
   * Obtiene un reporte por ID (solo admin)
   */
  static async getReportById(reportId: string): Promise<UserReport> {
    const { data, error } = await supabase
      .from('user_reports')
      .select('*, users:user_id(email, full_name)')
      .eq('id', reportId)
      .single();

    if (error || !data) {
      throw { statusCode: 404, message: 'Report not found' };
    }

    return data as UserReport;
  }

  /**
   * Actualiza el estado, prioridad o notas de un reporte (solo admin)
   */
  static async updateReport(reportId: string, payload: UpdateReportPayload): Promise<UserReport> {
    const updateData: Record<string, unknown> = {};

    if (payload.status !== undefined) {
      updateData.status = payload.status;
      if (payload.status === 'resolved' || payload.status === 'dismissed') {
        updateData.resolved_at = new Date().toISOString();
      } else {
        // Revert to a non-terminal state: clear any stale resolution timestamp
        updateData.resolved_at = null;
      }
    }

    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.admin_notes !== undefined) updateData.admin_notes = payload.admin_notes;

    const { data, error } = await supabase
      .from('user_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error || !data) {
      throw { statusCode: 500, message: 'Failed to update report' };
    }

    return data as UserReport;
  }

  /**
   * Obtiene estadísticas de reportes (solo admin)
   */
  static async getStats(): Promise<ReportStats> {
    const { data, error } = await supabase
      .from('user_reports')
      .select('type, status');

    if (error) {
      throw { statusCode: 500, message: 'Failed to fetch report stats' };
    }

    const stats: ReportStats = {
      total: data.length,
      open: 0,
      in_review: 0,
      resolved: 0,
      dismissed: 0,
      by_type: {
        question_error: 0,
        system_bug: 0,
        suggestion: 0,
        other: 0,
      },
    };

    for (const row of data) {
      if (row.status in stats) {
        (stats as unknown as Record<string, number>)[row.status]++;
      }
      if (row.type in stats.by_type) {
        stats.by_type[row.type as ReportType]++;
      }
    }

    return stats;
  }
}
