import { apiClient } from './apiClient';
import { Employee, EmployeeFormData, EmployeeSkill, SkillFormData } from '@/types/employee';
import { ApiResponse, PaginationInfo, PaginationParams } from '@/types/api';
import { buildQueryString } from '@/lib/utils/queryParams';

export interface EmployeeQueryParams extends PaginationParams {
  role?: string;
}

export interface EmployeesListResponse {
  employees: Employee[];
  pagination: PaginationInfo;
}

export const employeesApi = {
  // Get all employees with optional filters and pagination
  async getEmployees(params?: EmployeeQueryParams): Promise<ApiResponse<EmployeesListResponse>> {
    const queryString = buildQueryString(params);
    return apiClient.get<EmployeesListResponse>(`/employees${queryString}`);
  },

  // Get a single employee by ID
  async getEmployee(id: number): Promise<ApiResponse<Employee>> {
    return apiClient.get<Employee>(`/employees/${id}`);
  },

  // Create a new employee
  async createEmployee(data: EmployeeFormData): Promise<ApiResponse<Employee>> {
    return apiClient.post<Employee>('/employees', data);
  },

  // Update an existing employee
  async updateEmployee(id: number, data: Partial<EmployeeFormData>): Promise<ApiResponse<Employee>> {
    return apiClient.patch<Employee>(`/employees/${id}`, data);
  },

  // Delete an employee
  async deleteEmployee(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/employees/${id}`);
  },

  // Get all skills for an employee
  async getEmployeeSkills(id: number): Promise<ApiResponse<EmployeeSkill[]>> {
    return apiClient.get<EmployeeSkill[]>(`/employees/${id}/skills`);
  },

  // Add a skill to an employee
  async addEmployeeSkill(id: number, data: SkillFormData): Promise<ApiResponse<EmployeeSkill>> {
    return apiClient.post<EmployeeSkill>(`/employees/${id}/skills`, data);
  },

  // Update a skill level for an employee
  async updateEmployeeSkill(id: number, skillName: string, level: number): Promise<ApiResponse<EmployeeSkill>> {
    return apiClient.patch<EmployeeSkill>(`/employees/${id}/skills/${encodeURIComponent(skillName)}`, { level });
  },

  // Remove a skill from an employee
  async deleteEmployeeSkill(id: number, skillName: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/employees/${id}/skills/${encodeURIComponent(skillName)}`);
  },

  // Search employees by skill and minimum level
  async searchEmployeesBySkill(skillName: string, minLevel?: number): Promise<ApiResponse<Employee[]>> {
    const params = new URLSearchParams({ skillName });
    if (minLevel !== undefined) {
      params.append('minLevel', minLevel.toString());
    }
    return apiClient.get<Employee[]>(`/employees/search/by-skill?${params.toString()}`);
  },
};
