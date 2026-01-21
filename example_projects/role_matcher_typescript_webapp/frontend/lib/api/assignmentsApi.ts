import { apiClient } from './apiClient';
import { Assignment, AssignmentFormData, AssignmentStatus, Recommendation } from '@/types/assignment';
import { ApiResponse, PaginationInfo, PaginationParams } from '@/types/api';
import { buildQueryString } from '@/lib/utils/queryParams';

export interface AssignmentQueryParams extends PaginationParams {
  taskId?: number;
  employeeId?: number;
  status?: AssignmentStatus;
}

export interface AssignmentsListResponse {
  assignments: Assignment[];
  pagination: PaginationInfo;
}

export const assignmentsApi = {
  // Get all assignments with optional filters and pagination
  async getAssignments(params?: AssignmentQueryParams): Promise<ApiResponse<AssignmentsListResponse>> {
    const queryString = buildQueryString(params);
    return apiClient.get<AssignmentsListResponse>(`/assignments${queryString}`);
  },

  // Get a single assignment by ID
  async getAssignment(id: number): Promise<ApiResponse<Assignment>> {
    return apiClient.get<Assignment>(`/assignments/${id}`);
  },

  // Create a new assignment
  async createAssignment(data: AssignmentFormData): Promise<ApiResponse<Assignment>> {
    return apiClient.post<Assignment>('/assignments', data);
  },

  // Update assignment status
  async updateAssignmentStatus(id: number, status: AssignmentStatus): Promise<ApiResponse<Assignment>> {
    return apiClient.patch<Assignment>(`/assignments/${id}/status`, { status });
  },

  // Delete an assignment
  async deleteAssignment(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/assignments/${id}`);
  },

  // Get all assignments for a task
  async getTaskAssignments(taskId: number): Promise<ApiResponse<Assignment[]>> {
    return apiClient.get<Assignment[]>(`/assignments/tasks/${taskId}/assignments`);
  },

  // Get all assignments for an employee
  async getEmployeeAssignments(employeeId: number, status?: AssignmentStatus): Promise<ApiResponse<Assignment[]>> {
    const queryString = status ? `?status=${status}` : '';
    return apiClient.get<Assignment[]>(`/assignments/employees/${employeeId}/assignments${queryString}`);
  },

  // Get employee recommendations for a task
  async getTaskRecommendations(taskId: number, limit: number = 10): Promise<ApiResponse<Recommendation[]>> {
    return apiClient.post<Recommendation[]>(`/assignments/tasks/${taskId}/recommend-employees`, { limit });
  },
};
