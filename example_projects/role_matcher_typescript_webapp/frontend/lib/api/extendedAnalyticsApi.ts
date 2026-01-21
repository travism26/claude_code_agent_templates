import { apiClient } from './apiClient';
import {
  SkillDistribution,
  SkillGap,
  EmployeeUtilization,
  AssignmentStats,
  UnassignableTask,
} from '@/types/analytics';
import { ApiResponse } from '@/types/api';

export const extendedAnalyticsApi = {
  // Get skill distribution across employees
  async getSkillDistribution(): Promise<ApiResponse<SkillDistribution[]>> {
    return apiClient.get<SkillDistribution[]>('/analytics/skills/distribution');
  },

  // Get tasks with no qualified employees (skill gaps)
  async getSkillGaps(): Promise<ApiResponse<SkillGap[]>> {
    return apiClient.get<SkillGap[]>('/analytics/skills/gaps');
  },

  // Get employee capacity and workload statistics
  async getEmployeeUtilization(): Promise<ApiResponse<EmployeeUtilization[]>> {
    return apiClient.get<EmployeeUtilization[]>('/analytics/employees/utilization');
  },

  // Get assignment acceptance vs rejection rate
  async getAssignmentCompletionRate(): Promise<ApiResponse<AssignmentStats>> {
    return apiClient.get<AssignmentStats>('/analytics/assignments/completion-rate');
  },

  // Get tasks with no qualified employees
  async getUnassignableTasks(): Promise<ApiResponse<UnassignableTask[]>> {
    return apiClient.get<UnassignableTask[]>('/analytics/tasks/unassignable');
  },
};
