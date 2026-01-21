import { AuditLogModel } from '../models/AuditLog';
import { AuditLog, Task, Employee, Assignment, EmployeeSkill } from '../types';

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  taskId?: number;
  action?: 'create' | 'update' | 'delete';
}

/**
 * Service layer for audit log operations
 * Encapsulates all business logic related to audit logging
 */
export class AuditService {
  /**
   * Log task creation event
   */
  async logTaskCreation(taskId: number, task: Task): Promise<void> {
    try {
      AuditLogModel.create({
        taskId,
        action: 'create',
        userId: null,
        changes: JSON.stringify({ created: task })
      });
    } catch (error) {
      console.error('Failed to log task creation:', error);
      throw new Error('Failed to create audit log for task creation');
    }
  }

  /**
   * Log task update event with before/after snapshots
   */
  async logTaskUpdate(taskId: number, before: Task, after: Task): Promise<void> {
    try {
      AuditLogModel.create({
        taskId,
        action: 'update',
        userId: null,
        changes: JSON.stringify({ before, after })
      });
    } catch (error) {
      console.error('Failed to log task update:', error);
      throw new Error('Failed to create audit log for task update');
    }
  }

  /**
   * Log task deletion event
   */
  async logTaskDeletion(taskId: number, task: Task): Promise<void> {
    try {
      AuditLogModel.create({
        taskId,
        action: 'delete',
        userId: null,
        changes: JSON.stringify({ deleted: task })
      });
    } catch (error) {
      console.error('Failed to log task deletion:', error);
      throw new Error('Failed to create audit log for task deletion');
    }
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(params: AuditQueryParams): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const logs = AuditLogModel.findAll(params);
      const total = AuditLogModel.count({
        taskId: params.taskId,
        action: params.action
      });

      return { logs, total };
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  /**
   * Get complete audit history for a specific task
   */
  async getTaskAuditHistory(taskId: number): Promise<AuditLog[]> {
    try {
      return AuditLogModel.findByTaskId(taskId);
    } catch (error) {
      console.error(`Failed to retrieve audit history for task ${taskId}:`, error);
      throw new Error(`Failed to retrieve audit history for task ${taskId}`);
    }
  }

  /**
   * Log employee creation event
   */
  async logEmployeeCreation(employeeId: number, employee: Employee): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: null,
        action: 'create',
        userId: null,
        changes: JSON.stringify({ type: 'employee', id: employeeId, created: employee })
      });
    } catch (error) {
      console.error('Failed to log employee creation:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log employee update event
   */
  async logEmployeeUpdate(employeeId: number, before: Employee, after: Employee): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: null,
        action: 'update',
        userId: null,
        changes: JSON.stringify({ type: 'employee', id: employeeId, before, after })
      });
    } catch (error) {
      console.error('Failed to log employee update:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log employee deletion event
   */
  async logEmployeeDeletion(employeeId: number, employee: Employee): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: null,
        action: 'delete',
        userId: null,
        changes: JSON.stringify({ type: 'employee', id: employeeId, deleted: employee })
      });
    } catch (error) {
      console.error('Failed to log employee deletion:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log skill addition event
   */
  async logSkillAddition(employeeId: number, skill: EmployeeSkill): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: null,
        action: 'create',
        userId: null,
        changes: JSON.stringify({ type: 'skill', employeeId, added: skill })
      });
    } catch (error) {
      console.error('Failed to log skill addition:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log skill update event
   */
  async logSkillUpdate(employeeId: number, before: EmployeeSkill, after: EmployeeSkill): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: null,
        action: 'update',
        userId: null,
        changes: JSON.stringify({ type: 'skill', employeeId, before, after })
      });
    } catch (error) {
      console.error('Failed to log skill update:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log skill removal event
   */
  async logSkillRemoval(employeeId: number, skillName: string): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: null,
        action: 'delete',
        userId: null,
        changes: JSON.stringify({ type: 'skill', employeeId, removed: skillName })
      });
    } catch (error) {
      console.error('Failed to log skill removal:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log assignment creation event
   */
  async logAssignmentCreation(assignment: Assignment): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: assignment.taskId,
        action: 'create',
        userId: null,
        changes: JSON.stringify({ type: 'assignment', created: assignment })
      });
    } catch (error) {
      console.error('Failed to log assignment creation:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log assignment status change event
   */
  async logAssignmentStatusChange(assignment: Assignment, oldStatus: string, newStatus: string): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: assignment.taskId,
        action: 'update',
        userId: null,
        changes: JSON.stringify({
          type: 'assignment',
          id: assignment.id,
          statusChange: { from: oldStatus, to: newStatus },
          assignment
        })
      });
    } catch (error) {
      console.error('Failed to log assignment status change:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Log assignment deletion event
   */
  async logAssignmentDeletion(assignment: Assignment): Promise<void> {
    try {
      AuditLogModel.create({
        taskId: assignment.taskId,
        action: 'delete',
        userId: null,
        changes: JSON.stringify({ type: 'assignment', deleted: assignment })
      });
    } catch (error) {
      console.error('Failed to log assignment deletion:', error);
      // Don't throw - audit logging should not break main operations
    }
  }
}
