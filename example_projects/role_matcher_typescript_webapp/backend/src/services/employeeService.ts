import { EmployeeModel } from '../models/Employee';
import { Employee, EmployeeSkill, PaginationInfo, PaginationParams } from '../types';

export interface EmployeeQueryParams extends PaginationParams {
  role?: string;
}

export interface CreateEmployeeData {
  name: string;
  role: string;
  capacity?: number;
}

export interface UpdateEmployeeData {
  name?: string;
  role?: string;
  capacity?: number;
}

/**
 * Service layer for employee operations
 * Encapsulates all business logic related to employees including:
 * - CRUD operations
 * - Skill management
 * - Capacity and workload tracking
 * - Skill profile calculations
 */
export class EmployeeService {
  /**
   * Get all employees with pagination and filtering
   */
  async getAllEmployees(params: EmployeeQueryParams = {}): Promise<{ employees: Employee[]; pagination: PaginationInfo }> {
    try {
      const { page = 1, limit = 50, role } = params;

      const employees = EmployeeModel.findAll({ page, limit, role });
      const total = EmployeeModel.count({ role });

      return {
        employees,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Failed to get employees:', error);
      throw new Error('Failed to retrieve employees');
    }
  }

  /**
   * Get a single employee by ID with full skill profile
   */
  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const employee = EmployeeModel.findById(id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      return employee;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to get employee ${id}:`, error);
      throw new Error(`Failed to retrieve employee ${id}`);
    }
  }

  /**
   * Create a new employee with validation
   */
  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    try {
      // Validate capacity
      if (data.capacity !== undefined && (data.capacity < 0 || data.capacity > 100)) {
        throw new Error('Capacity must be between 0 and 100');
      }

      const employee = EmployeeModel.create({
        name: data.name,
        role: data.role,
        capacity: data.capacity ?? 100,
        workload: 0
      });

      return employee;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Capacity')) {
        throw error;
      }
      console.error('Failed to create employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  /**
   * Update an existing employee
   */
  async updateEmployee(id: number, updates: UpdateEmployeeData): Promise<Employee> {
    try {
      // Validate capacity if provided
      if (updates.capacity !== undefined && (updates.capacity < 0 || updates.capacity > 100)) {
        throw new Error('Capacity must be between 0 and 100');
      }

      const employee = EmployeeModel.update(id, updates);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }

      return employee;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Capacity'))) {
        throw error;
      }
      console.error(`Failed to update employee ${id}:`, error);
      throw new Error(`Failed to update employee ${id}`);
    }
  }

  /**
   * Delete an employee with cascade warnings
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      const employee = EmployeeModel.findById(id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }

      // Check for active assignments (optional warning - assignments will cascade delete)
      // This is handled by database foreign key constraints with CASCADE

      const deleted = EmployeeModel.delete(id);
      if (!deleted) {
        throw new Error(`Failed to delete employee ${id}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to delete employee ${id}:`, error);
      throw new Error(`Failed to delete employee ${id}`);
    }
  }

  /**
   * Add a skill to an employee with level validation
   */
  async addSkill(employeeId: number, skillName: string, level: number): Promise<EmployeeSkill> {
    try {
      // Validate level
      if (level < 1 || level > 5) {
        throw new Error('Skill level must be between 1 and 5');
      }

      const skill = EmployeeModel.addSkill(employeeId, skillName, level);
      return skill;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('level') || error.message.includes('not found') || error.message.includes('already has'))) {
        throw error;
      }
      console.error(`Failed to add skill to employee ${employeeId}:`, error);
      throw new Error('Failed to add skill');
    }
  }

  /**
   * Update skill level for an employee
   */
  async updateSkillLevel(employeeId: number, skillName: string, level: number): Promise<EmployeeSkill> {
    try {
      // Validate level
      if (level < 1 || level > 5) {
        throw new Error('Skill level must be between 1 and 5');
      }

      const skill = EmployeeModel.updateSkill(employeeId, skillName, level);
      if (!skill) {
        throw new Error(`Skill ${skillName} not found for employee ${employeeId}`);
      }

      return skill;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('level') || error.message.includes('not found') || error.message.includes('does not have'))) {
        throw error;
      }
      console.error(`Failed to update skill for employee ${employeeId}:`, error);
      throw new Error('Failed to update skill level');
    }
  }

  /**
   * Remove a skill from an employee
   */
  async removeSkill(employeeId: number, skillName: string): Promise<void> {
    try {
      const removed = EmployeeModel.removeSkill(employeeId, skillName);
      if (!removed) {
        throw new Error(`Failed to remove skill ${skillName}`);
      }
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('does not have'))) {
        throw error;
      }
      console.error(`Failed to remove skill from employee ${employeeId}:`, error);
      throw new Error('Failed to remove skill');
    }
  }

  /**
   * Get all skills for an employee
   */
  async getEmployeeSkills(employeeId: number): Promise<Array<{ skillName: string; level: number }>> {
    try {
      const employee = EmployeeModel.findById(employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }

      return EmployeeModel.getSkills(employeeId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to get skills for employee ${employeeId}:`, error);
      throw new Error('Failed to retrieve employee skills');
    }
  }

  /**
   * Calculate aggregate skill profile score (sum of all skill levels)
   */
  async calculateSkillProfileScore(employeeId: number): Promise<number> {
    try {
      const skills = await this.getEmployeeSkills(employeeId);
      return skills.reduce((sum, skill) => sum + skill.level, 0);
    } catch (error) {
      console.error(`Failed to calculate skill profile score for employee ${employeeId}:`, error);
      throw new Error('Failed to calculate skill profile score');
    }
  }

  /**
   * Update employee capacity with validation
   */
  async updateCapacity(employeeId: number, capacity: number): Promise<Employee> {
    try {
      if (capacity < 0 || capacity > 100) {
        throw new Error('Capacity must be between 0 and 100');
      }

      const employee = EmployeeModel.update(employeeId, { capacity });
      if (!employee) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }

      return employee;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Capacity') || error.message.includes('not found'))) {
        throw error;
      }
      console.error(`Failed to update capacity for employee ${employeeId}:`, error);
      throw new Error('Failed to update employee capacity');
    }
  }

  /**
   * Update employee workload (used by AssignmentService)
   */
  async updateWorkload(employeeId: number, workload: number): Promise<void> {
    try {
      const updated = EmployeeModel.updateWorkload(employeeId, workload);
      if (!updated) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to update workload for employee ${employeeId}:`, error);
      throw new Error('Failed to update employee workload');
    }
  }
}
