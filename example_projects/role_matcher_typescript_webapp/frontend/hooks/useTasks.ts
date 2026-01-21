import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Task, TaskFormData } from '@/types/task';
import { TaskQueryParams } from '@/types/api';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: TaskQueryParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};

// Get all tasks
export function useGetTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      const response = await tasksApi.getTasks(params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch tasks');
      }
      return response.data;
    },
  });
}

// Get single task
export function useGetTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const response = await tasksApi.getTask(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch task');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await tasksApi.createTask(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create task');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TaskFormData> }) => {
      const response = await tasksApi.updateTask(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update task');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await tasksApi.deleteTask(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// AI Prioritize
export function useAIPrioritize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await tasksApi.aiPrioritize();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to run AI prioritization');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
