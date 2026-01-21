import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { PaginationParams } from '@/types/api';

// Query keys
export const auditKeys = {
  all: ['audit'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...auditKeys.lists(), params] as const,
  taskLogs: (taskId: number, params?: PaginationParams) => [...auditKeys.all, 'task', taskId, params] as const,
};

// Get all audit logs
export function useAuditLogs(params?: PaginationParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const response = await auditApi.getAuditLogs(params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch audit logs');
      }
      return response.data;
    },
  });
}

// Get audit logs for specific task
export function useTaskAuditLogs(taskId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: auditKeys.taskLogs(taskId, params),
    queryFn: async () => {
      const response = await auditApi.getTaskAuditLogs(taskId, params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch task audit logs');
      }
      return response.data;
    },
    enabled: !!taskId,
  });
}
