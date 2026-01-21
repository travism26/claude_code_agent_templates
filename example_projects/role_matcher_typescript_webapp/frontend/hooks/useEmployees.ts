import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, EmployeeQueryParams } from '@/lib/api/employeesApi';
import { EmployeeFormData, SkillFormData } from '@/types/employee';

// Query keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: EmployeeQueryParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
  skills: (id: number) => [...employeeKeys.all, id, 'skills'] as const,
  search: () => [...employeeKeys.all, 'search'] as const,
  searchBySkill: (skillName: string, minLevel?: number) =>
    [...employeeKeys.search(), 'by-skill', { skillName, minLevel }] as const,
};

// Get all employees
export function useGetEmployees(params?: EmployeeQueryParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const response = await employeesApi.getEmployees(params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch employees');
      }
      return response.data;
    },
  });
}

// Get single employee
export function useGetEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const response = await employeesApi.getEmployee(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch employee');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Create employee
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await employeesApi.createEmployee(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create employee');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Update employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmployeeFormData> }) => {
      const response = await employeesApi.updateEmployee(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update employee');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.id) });
    },
  });
}

// Delete employee
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await employeesApi.deleteEmployee(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete employee');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Get employee skills
export function useGetEmployeeSkills(id: number) {
  return useQuery({
    queryKey: employeeKeys.skills(id),
    queryFn: async () => {
      const response = await employeesApi.getEmployeeSkills(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch employee skills');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// Add employee skill
export function useAddEmployeeSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SkillFormData }) => {
      const response = await employeesApi.addEmployeeSkill(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add skill');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.skills(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Update employee skill
export function useUpdateEmployeeSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, skillName, level }: { id: number; skillName: string; level: number }) => {
      const response = await employeesApi.updateEmployeeSkill(id, skillName, level);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update skill');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.skills(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Delete employee skill
export function useDeleteEmployeeSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, skillName }: { id: number; skillName: string }) => {
      const response = await employeesApi.deleteEmployeeSkill(id, skillName);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete skill');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.skills(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Search employees by skill
export function useSearchEmployeesBySkill(skillName: string, minLevel?: number) {
  return useQuery({
    queryKey: employeeKeys.searchBySkill(skillName, minLevel),
    queryFn: async () => {
      const response = await employeesApi.searchEmployeesBySkill(skillName, minLevel);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to search employees');
      }
      return response.data;
    },
    enabled: !!skillName && skillName.length > 0,
  });
}
