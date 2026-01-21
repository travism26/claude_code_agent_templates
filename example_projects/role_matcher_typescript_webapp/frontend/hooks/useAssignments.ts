import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, AssignmentQueryParams } from '@/lib/api/assignmentsApi';
import { AssignmentFormData, AssignmentStatus } from '@/types/assignment';
import { employeeKeys } from './useEmployees';

// Query keys
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (params?: AssignmentQueryParams) => [...assignmentKeys.lists(), params] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
  byTask: (taskId: number) => [...assignmentKeys.all, 'task', taskId] as const,
  byEmployee: (employeeId: number) => [...assignmentKeys.all, 'employee', employeeId] as const,
};

export const recommendationKeys = {
  all: ['recommendations'] as const,
  byTask: (taskId: number) => [...recommendationKeys.all, 'task', taskId] as const,
};

// Get all assignments
export function useGetAssignments(params?: AssignmentQueryParams) {
  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: async () => {
      const response = await assignmentsApi.getAssignments(params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch assignments');
      }
      return response.data;
    },
  });
}

// Get single assignment
export function useGetAssignment(id: number) {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: async () => {
      const response = await assignmentsApi.getAssignment(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch assignment');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Create assignment
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const response = await assignmentsApi.createAssignment(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create assignment');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate assignment queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byTask(data.taskId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byEmployee(data.employeeId) });

      // Invalidate employee queries (workload may have changed)
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.employeeId) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });

      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Update assignment status
export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AssignmentStatus }) => {
      const response = await assignmentsApi.updateAssignmentStatus(id, status);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update assignment status');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate assignment queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byTask(data.taskId) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.byEmployee(data.employeeId) });

      // Invalidate employee queries (workload may have changed)
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.employeeId) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });

      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Delete assignment
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await assignmentsApi.deleteAssignment(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete assignment');
      }
      return id;
    },
    onSuccess: () => {
      // Invalidate all assignment queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });

      // Invalidate employee queries (workload may have changed)
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });

      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Get assignments for a task
export function useGetTaskAssignments(taskId: number) {
  return useQuery({
    queryKey: assignmentKeys.byTask(taskId),
    queryFn: async () => {
      const response = await assignmentsApi.getTaskAssignments(taskId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch task assignments');
      }
      return response.data;
    },
    enabled: !!taskId,
  });
}

// Get assignments for an employee
export function useGetEmployeeAssignments(employeeId: number, status?: AssignmentStatus) {
  return useQuery({
    queryKey: assignmentKeys.byEmployee(employeeId),
    queryFn: async () => {
      const response = await assignmentsApi.getEmployeeAssignments(employeeId, status);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch employee assignments');
      }
      return response.data;
    },
    enabled: !!employeeId,
  });
}

// Get task recommendations
export function useGetTaskRecommendations(taskId: number, limit: number = 10) {
  return useQuery({
    queryKey: recommendationKeys.byTask(taskId),
    queryFn: async () => {
      const response = await assignmentsApi.getTaskRecommendations(taskId, limit);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch recommendations');
      }
      return response.data;
    },
    enabled: !!taskId,
  });
}
