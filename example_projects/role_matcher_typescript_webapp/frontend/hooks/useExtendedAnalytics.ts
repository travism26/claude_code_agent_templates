import { useQuery } from '@tanstack/react-query';
import { extendedAnalyticsApi } from '@/lib/api/extendedAnalyticsApi';

// Query keys
export const extendedAnalyticsKeys = {
  all: ['analytics'] as const,
  skills: () => [...extendedAnalyticsKeys.all, 'skills'] as const,
  skillDistribution: () => [...extendedAnalyticsKeys.skills(), 'distribution'] as const,
  skillGaps: () => [...extendedAnalyticsKeys.skills(), 'gaps'] as const,
  employees: () => [...extendedAnalyticsKeys.all, 'employees'] as const,
  employeeUtilization: () => [...extendedAnalyticsKeys.employees(), 'utilization'] as const,
  assignments: () => [...extendedAnalyticsKeys.all, 'assignments'] as const,
  assignmentCompletionRate: () => [...extendedAnalyticsKeys.assignments(), 'completion-rate'] as const,
  tasks: () => [...extendedAnalyticsKeys.all, 'tasks'] as const,
  unassignableTasks: () => [...extendedAnalyticsKeys.tasks(), 'unassignable'] as const,
};

// Get skill distribution
export function useSkillDistribution() {
  return useQuery({
    queryKey: extendedAnalyticsKeys.skillDistribution(),
    queryFn: async () => {
      const response = await extendedAnalyticsApi.getSkillDistribution();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch skill distribution');
      }
      return response.data;
    },
  });
}

// Get skill gaps
export function useSkillGaps() {
  return useQuery({
    queryKey: extendedAnalyticsKeys.skillGaps(),
    queryFn: async () => {
      const response = await extendedAnalyticsApi.getSkillGaps();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch skill gaps');
      }
      return response.data;
    },
  });
}

// Get employee utilization
export function useEmployeeUtilization() {
  return useQuery({
    queryKey: extendedAnalyticsKeys.employeeUtilization(),
    queryFn: async () => {
      const response = await extendedAnalyticsApi.getEmployeeUtilization();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch employee utilization');
      }
      return response.data;
    },
  });
}

// Get assignment completion rate
export function useAssignmentCompletionRate() {
  return useQuery({
    queryKey: extendedAnalyticsKeys.assignmentCompletionRate(),
    queryFn: async () => {
      const response = await extendedAnalyticsApi.getAssignmentCompletionRate();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch assignment completion rate');
      }
      return response.data;
    },
  });
}

// Get unassignable tasks
export function useUnassignableTasks() {
  return useQuery({
    queryKey: extendedAnalyticsKeys.unassignableTasks(),
    queryFn: async () => {
      const response = await extendedAnalyticsApi.getUnassignableTasks();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch unassignable tasks');
      }
      return response.data;
    },
  });
}
