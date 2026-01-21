import { apiClient } from './apiClient';
import { Task, TaskFormData, AIPrioritizationResponse } from '@/types/task';
import { ApiResponse, TaskQueryParams, PaginationInfo } from '@/types/api';
import { buildQueryString } from '@/lib/utils/queryParams';

export interface TasksListResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

export const tasksApi = {
  // Get all tasks with optional filters, sorting, and pagination
  async getTasks(params?: TaskQueryParams): Promise<ApiResponse<TasksListResponse>> {
    const queryString = buildQueryString(params);
    return apiClient.get<TasksListResponse>(`/tasks${queryString}`);
  },

  // Get a single task by ID
  async getTask(id: number): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  // Create a new task
  async createTask(data: TaskFormData): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/tasks', data);
  },

  // Update an existing task
  async updateTask(id: number, data: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  },

  // Delete a task
  async deleteTask(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },

  // Trigger AI prioritization
  async aiPrioritize(): Promise<ApiResponse<AIPrioritizationResponse>> {
    return apiClient.post<AIPrioritizationResponse>('/tasks/ai-prioritize');
  },
};
