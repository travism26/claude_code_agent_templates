import { AssignmentModel, AssignmentFilters } from '../models/Assignment';
import { Assignment, PaginationInfo, PaginationParams, MatchResult } from '../types';
import { EmployeeService } from './employeeService';
import { SkillMatchingService } from './skillMatchingService';

export interface AssignmentQueryParams extends PaginationParams, AssignmentFilters {}

export interface CreateAssignmentData {
  taskId: number;
  employeeId: number;
  score: number;
  status?: 'proposed' | 'accepted' | 'rejected';
}

/**
 * Service layer for assignment operations
 * Encapsulates all business logic related to assignments including:
 * - CRUD operations
 * - Automatic workload tracking
 * - Task-to-employee recommendations
 * - Match score calculations
 */
export class AssignmentService {
  private employeeService: EmployeeService;
  private skillMatchingService: SkillMatchingService;

  constructor(employeeService: EmployeeService, skillMatchingService: SkillMatchingService) {
    this.employeeService = employeeService;
    this.skillMatchingService = skillMatchingService;
  }

  /**
   * Create a new assignment with automatic workload tracking
   */
  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    try {
      // Validate score
      if (data.score < 0 || data.score > 100) {
        throw new Error('Assignment score must be between 0 and 100');
      }

      // Create the assignment
      const assignment = AssignmentModel.create({
        taskId: data.taskId,
        employeeId: data.employeeId,
        score: data.score,
        status: data.status || 'proposed'
      });

      // Update workload if assignment is accepted
      if (assignment.status === 'accepted') {
        const employee = await this.employeeService.getEmployeeById(assignment.employeeId);
        await this.employeeService.updateWorkload(assignment.employeeId, employee.workload + 1);
      }

      return assignment;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('score') || error.message.includes('already exists'))) {
        throw error;
      }
      console.error('Failed to create assignment:', error);
      throw new Error('Failed to create assignment');
    }
  }

  /**
   * Get a single assignment by ID
   */
  async getAssignment(id: number): Promise<Assignment> {
    try {
      const assignment = AssignmentModel.findById(id);
      if (!assignment) {
        throw new Error(`Assignment with ID ${id} not found`);
      }
      return assignment;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to get assignment ${id}:`, error);
      throw new Error(`Failed to retrieve assignment ${id}`);
    }
  }

  /**
   * Update assignment status with workload tracking
   */
  async updateAssignmentStatus(id: number, status: 'proposed' | 'accepted' | 'rejected'): Promise<Assignment> {
    try {
      const existingAssignment = AssignmentModel.findById(id);
      if (!existingAssignment) {
        throw new Error(`Assignment with ID ${id} not found`);
      }

      // Track workload changes
      const employee = await this.employeeService.getEmployeeById(existingAssignment.employeeId);
      const oldStatus = existingAssignment.status;
      const newStatus = status;

      // Update the assignment
      const updatedAssignment = AssignmentModel.update(id, { status });
      if (!updatedAssignment) {
        throw new Error(`Failed to update assignment ${id}`);
      }

      // Update employee workload based on status transition
      let workloadChange = 0;

      if (oldStatus !== 'accepted' && newStatus === 'accepted') {
        // Accepting an assignment: increment workload
        workloadChange = 1;
      } else if (oldStatus === 'accepted' && newStatus !== 'accepted') {
        // Rejecting or changing from accepted: decrement workload
        workloadChange = -1;
      }

      if (workloadChange !== 0) {
        await this.employeeService.updateWorkload(
          existingAssignment.employeeId,
          employee.workload + workloadChange
        );
      }

      return updatedAssignment;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to update assignment status ${id}:`, error);
      throw new Error(`Failed to update assignment status ${id}`);
    }
  }

  /**
   * Delete an assignment with workload cleanup
   */
  async deleteAssignment(id: number): Promise<void> {
    try {
      const assignment = AssignmentModel.findById(id);
      if (!assignment) {
        throw new Error(`Assignment with ID ${id} not found`);
      }

      // If assignment was accepted, decrement workload
      if (assignment.status === 'accepted') {
        const employee = await this.employeeService.getEmployeeById(assignment.employeeId);
        await this.employeeService.updateWorkload(assignment.employeeId, employee.workload - 1);
      }

      const deleted = AssignmentModel.delete(id);
      if (!deleted) {
        throw new Error(`Failed to delete assignment ${id}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to delete assignment ${id}:`, error);
      throw new Error(`Failed to delete assignment ${id}`);
    }
  }

  /**
   * Get all assignments with pagination and filtering
   */
  async getAllAssignments(params: AssignmentQueryParams = {}): Promise<{ assignments: Assignment[]; pagination: PaginationInfo }> {
    try {
      const { page = 1, limit = 50, taskId, employeeId, status } = params;

      const assignments = AssignmentModel.findAll({ page, limit, taskId, employeeId, status });
      const total = AssignmentModel.count({ taskId, employeeId, status });

      return {
        assignments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Failed to get assignments:', error);
      throw new Error('Failed to retrieve assignments');
    }
  }

  /**
   * Get all assignments for a specific task
   */
  async getTaskAssignments(taskId: number): Promise<Assignment[]> {
    try {
      return AssignmentModel.findByTask(taskId);
    } catch (error) {
      console.error(`Failed to get assignments for task ${taskId}:`, error);
      throw new Error(`Failed to retrieve assignments for task ${taskId}`);
    }
  }

  /**
   * Get all assignments for a specific employee
   */
  async getEmployeeAssignments(employeeId: number, status?: 'proposed' | 'accepted' | 'rejected'): Promise<Assignment[]> {
    try {
      const assignments = AssignmentModel.findByEmployee(employeeId);

      if (status) {
        return assignments.filter(a => a.status === status);
      }

      return assignments;
    } catch (error) {
      console.error(`Failed to get assignments for employee ${employeeId}:`, error);
      throw new Error(`Failed to retrieve assignments for employee ${employeeId}`);
    }
  }

  /**
   * Recommend best employees for a task based on skill matching
   */
  async recommendEmployeesForTask(taskId: number, limit: number = 10): Promise<MatchResult[]> {
    try {
      const recommendations = await this.skillMatchingService.findBestMatches(taskId, limit);
      return recommendations;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to recommend employees for task ${taskId}:`, error);
      throw new Error(`Failed to recommend employees for task ${taskId}`);
    }
  }
}
