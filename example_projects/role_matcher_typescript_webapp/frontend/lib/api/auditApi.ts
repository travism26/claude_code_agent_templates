import { apiClient } from './apiClient';
import { AuditLog } from '@/types/task';
import { ApiResponse, PaginationParams, PaginationInfo } from '@/types/api';

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: PaginationInfo;
}

export const auditApi = {
  // Get all audit logs with optional pagination
  async getAuditLogs(params?: PaginationParams): Promise<ApiResponse<AuditLogsResponse>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.get<AuditLogsResponse>(`/audit${queryString}`);
  },

  // Get audit logs for a specific task
  async getTaskAuditLogs(taskId: number, params?: PaginationParams): Promise<ApiResponse<AuditLogsResponse>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.get<AuditLogsResponse>(`/audit/task/${taskId}${queryString}`);
  },
};
