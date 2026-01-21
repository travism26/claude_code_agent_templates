import { TaskModel } from '../models/Task';
import { Task, AIPrioritizationResponse, PaginationParams, SortParams, TaskFilters, PaginationInfo, SkillRequirement } from '../types';
import { calculatePriority, recalculateTaskPriority } from './priorityCalculator';
import { aiPrioritize } from './aiService';
import { AuditService } from './auditService';

export interface TaskQueryParams extends PaginationParams, SortParams, TaskFilters {}

export interface CreateTaskData {
  title: string;
  description: string;
  dueDate?: string | null;
  effort: number;
  importance: number;
  category: string;
  status?: 'pending' | 'in_progress' | 'completed';
  requiredSkills?: SkillRequirement[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string | null;
  effort?: number;
  importance?: number;
  category?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  requiredSkills?: SkillRequirement[];
}

/**
 * Service layer for task operations
 * Encapsulates all business logic related to tasks including:
 * - CRUD operations
 * - Priority calculation
 * - AI prioritization
 * - Automatic audit logging
 */
export class TaskService {
  private auditService: AuditService;

  constructor(auditService: AuditService) {
    this.auditService = auditService;
  }

  /**
   * Get all tasks with pagination, filtering, and sorting
   */
  async getAllTasks(params: TaskQueryParams = {}): Promise<{ tasks: Task[]; pagination: PaginationInfo }> {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        category,
        minPriority,
        maxPriority
      } = params;

      const tasks = TaskModel.findAll(params);
      const total = TaskModel.count({
        status,
        category,
        minPriority,
        maxPriority
      });

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Failed to get tasks:', error);
      throw new Error('Failed to retrieve tasks');
    }
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(id: number): Promise<Task> {
    try {
      const task = TaskModel.findById(id);
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }
      return task;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to get task ${id}:`, error);
      throw new Error(`Failed to retrieve task ${id}`);
    }
  }

  /**
   * Create a new task with automatic priority calculation and audit logging
   */
  async createTask(data: CreateTaskData): Promise<Task> {
    try {
      // Calculate priority based on task attributes
      const priority = calculatePriority({
        importance: data.importance,
        effort: data.effort,
        dueDate: data.dueDate || null,
        category: data.category
      });

      // Create the task
      const task = TaskModel.create({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || null,
        effort: data.effort,
        importance: data.importance,
        category: data.category,
        priority,
        status: data.status || 'pending',
        requiredSkills: data.requiredSkills
      });

      // Log the creation event
      await this.auditService.logTaskCreation(task.id, task);

      return task;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Update an existing task with priority recalculation and audit logging
   */
  async updateTask(id: number, updates: UpdateTaskData): Promise<Task> {
    try {
      // Get existing task
      const existingTask = TaskModel.findById(id);
      if (!existingTask) {
        throw new Error(`Task with ID ${id} not found`);
      }

      // Prepare updates object
      const taskUpdates: any = { ...updates };

      // Recalculate priority if relevant fields changed
      if (
        updates.importance !== undefined ||
        updates.effort !== undefined ||
        updates.dueDate !== undefined ||
        updates.category !== undefined
      ) {
        const taskForPriority = {
          importance: updates.importance ?? existingTask.importance,
          effort: updates.effort ?? existingTask.effort,
          dueDate: updates.dueDate !== undefined ? updates.dueDate : existingTask.dueDate,
          category: updates.category ?? existingTask.category
        };
        taskUpdates.priority = recalculateTaskPriority(taskForPriority);
      }

      // Update the task
      const updatedTask = TaskModel.update(id, taskUpdates);
      if (!updatedTask) {
        throw new Error(`Failed to update task ${id}`);
      }

      // Log the update event
      await this.auditService.logTaskUpdate(id, existingTask, updatedTask);

      return updatedTask;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to update task ${id}:`, error);
      throw new Error(`Failed to update task ${id}`);
    }
  }

  /**
   * Delete a task with audit logging
   */
  async deleteTask(id: number): Promise<void> {
    try {
      // Get existing task for audit log
      const existingTask = TaskModel.findById(id);
      if (!existingTask) {
        throw new Error(`Task with ID ${id} not found`);
      }

      // Delete the task
      const deleted = TaskModel.delete(id);
      if (!deleted) {
        throw new Error(`Failed to delete task ${id}`);
      }

      // Log the deletion event
      await this.auditService.logTaskDeletion(id, existingTask);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      console.error(`Failed to delete task ${id}:`, error);
      throw new Error(`Failed to delete task ${id}`);
    }
  }

  /**
   * AI-powered task prioritization
   * Analyzes pending tasks and provides intelligent prioritization suggestions
   */
  async aiPrioritizeTasks(): Promise<AIPrioritizationResponse> {
    try {
      // Get all non-completed tasks
      const tasks = TaskModel.findAll({
        status: 'pending',
        sortBy: 'priority',
        sortOrder: 'desc',
        limit: 50
      });

      if (tasks.length === 0) {
        return {
          rerankedTasks: [],
          missingSuggestions: ['No pending tasks to prioritize'],
          identifiedRisks: []
        };
      }

      // Call AI service for prioritization
      const result = await aiPrioritize(tasks);
      return result;
    } catch (error) {
      console.error('Failed to perform AI prioritization:', error);
      throw new Error('Failed to perform AI prioritization');
    }
  }
}
