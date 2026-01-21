import { TaskModel } from '../models/Task';
import { Task, AnalyticsSummary } from '../types';
import { getDatabase } from '../config/database';

/**
 * Service layer for analytics operations
 * Encapsulates all analytics-related business logic and data aggregation
 */
export class AnalyticsService {
  /**
   * Get count of tasks grouped by category
   */
  async getCategoryCounts(): Promise<Array<{ category: string; count: number }>> {
    try {
      return TaskModel.getCategoryCounts();
    } catch (error) {
      console.error('Failed to get category counts:', error);
      throw new Error('Failed to retrieve category statistics');
    }
  }

  /**
   * Get all overdue tasks with count
   */
  async getOverdueTasks(): Promise<{ count: number; tasks: Task[] }> {
    try {
      const tasks = TaskModel.findOverdue();
      return {
        count: tasks.length,
        tasks
      };
    } catch (error) {
      console.error('Failed to get overdue tasks:', error);
      throw new Error('Failed to retrieve overdue tasks');
    }
  }

  /**
   * Get all tasks due today with count
   */
  async getTodayTasks(): Promise<{ count: number; tasks: Task[] }> {
    try {
      const tasks = TaskModel.findDueToday();
      return {
        count: tasks.length,
        tasks
      };
    } catch (error) {
      console.error('Failed to get tasks due today:', error);
      throw new Error('Failed to retrieve tasks due today');
    }
  }

  /**
   * Get distribution of tasks by effort level
   */
  async getEffortDistribution(): Promise<Array<{ effort: number; count: number }>> {
    try {
      return TaskModel.getEffortDistribution();
    } catch (error) {
      console.error('Failed to get effort distribution:', error);
      throw new Error('Failed to retrieve effort distribution');
    }
  }

  /**
   * Get comprehensive analytics summary
   * Aggregates multiple metrics into a single response
   */
  async getSummary(): Promise<AnalyticsSummary> {
    try {
      const totalTasks = TaskModel.count();
      const pendingTasks = TaskModel.count({ status: 'pending' });
      const inProgressTasks = TaskModel.count({ status: 'in_progress' });
      const completedTasks = TaskModel.count({ status: 'completed' });
      const overdueTasks = TaskModel.findOverdue();
      const todayTasks = TaskModel.findDueToday();

      return {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks.length,
        dueToday: todayTasks.length
      };
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      throw new Error('Failed to retrieve analytics summary');
    }
  }

  /**
   * Get skill distribution across all employees
   * Returns count of employees with each skill
   */
  async getSkillDistribution(): Promise<Array<{ skillName: string; employeeCount: number; avgLevel: number }>> {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT
          skillName,
          COUNT(*) as employeeCount,
          AVG(level) as avgLevel
        FROM employee_skills
        GROUP BY skillName
        ORDER BY employeeCount DESC, skillName ASC
      `);
      return stmt.all() as Array<{ skillName: string; employeeCount: number; avgLevel: number }>;
    } catch (error) {
      console.error('Failed to get skill distribution:', error);
      throw new Error('Failed to retrieve skill distribution');
    }
  }

  /**
   * Identify skill gaps - tasks requiring skills no employees have
   */
  async getSkillGaps(): Promise<Array<{ taskId: number; taskTitle: string; missingSkills: string[] }>> {
    try {
      const db = getDatabase();

      // Get all tasks with required skills
      const tasks = TaskModel.findAll({ limit: 1000 });
      const gaps: Array<{ taskId: number; taskTitle: string; missingSkills: string[] }> = [];

      for (const task of tasks) {
        if (!task.requiredSkills || task.requiredSkills.length === 0) continue;

        const missingSkills: string[] = [];

        for (const requirement of task.requiredSkills) {
          // Check if any employee has this skill at the required level
          const stmt = db.prepare(`
            SELECT COUNT(*) as count
            FROM employee_skills
            WHERE skillName = ? AND level >= ?
          `);
          const result = stmt.get(requirement.skillName, requirement.minLevel) as { count: number };

          if (result.count === 0) {
            missingSkills.push(requirement.skillName);
          }
        }

        if (missingSkills.length > 0) {
          gaps.push({
            taskId: task.id,
            taskTitle: task.title,
            missingSkills
          });
        }
      }

      return gaps;
    } catch (error) {
      console.error('Failed to get skill gaps:', error);
      throw new Error('Failed to retrieve skill gaps');
    }
  }

  /**
   * Get employee utilization statistics
   */
  async getEmployeeUtilization(): Promise<Array<{
    employeeId: number;
    employeeName: string;
    capacity: number;
    workload: number;
    utilizationPercent: number
  }>> {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT
          id as employeeId,
          name as employeeName,
          capacity,
          workload,
          CASE
            WHEN capacity > 0 THEN ROUND((workload * 100.0) / capacity, 2)
            ELSE 0
          END as utilizationPercent
        FROM employees
        ORDER BY utilizationPercent DESC
      `);
      return stmt.all() as Array<{
        employeeId: number;
        employeeName: string;
        capacity: number;
        workload: number;
        utilizationPercent: number
      }>;
    } catch (error) {
      console.error('Failed to get employee utilization:', error);
      throw new Error('Failed to retrieve employee utilization');
    }
  }

  /**
   * Get assignment completion rate statistics
   */
  async getAssignmentCompletionRate(): Promise<{
    total: number;
    proposed: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  }> {
    try {
      const db = getDatabase();

      const totalStmt = db.prepare('SELECT COUNT(*) as count FROM assignments');
      const total = (totalStmt.get() as { count: number }).count;

      const proposedStmt = db.prepare('SELECT COUNT(*) as count FROM assignments WHERE status = ?');
      const proposed = (proposedStmt.get('proposed') as { count: number }).count;

      const acceptedStmt = db.prepare('SELECT COUNT(*) as count FROM assignments WHERE status = ?');
      const accepted = (acceptedStmt.get('accepted') as { count: number }).count;

      const rejectedStmt = db.prepare('SELECT COUNT(*) as count FROM assignments WHERE status = ?');
      const rejected = (rejectedStmt.get('rejected') as { count: number }).count;

      const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

      return {
        total,
        proposed,
        accepted,
        rejected,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get assignment completion rate:', error);
      throw new Error('Failed to retrieve assignment completion rate');
    }
  }

  /**
   * Get tasks that cannot be assigned (no qualified employees)
   */
  async getUnassignableTasks(): Promise<Array<{
    taskId: number;
    taskTitle: string;
    requiredSkills: string[];
    reason: string
  }>> {
    try {
      const db = getDatabase();
      const tasks = TaskModel.findAll({ limit: 1000 });
      const unassignable: Array<{
        taskId: number;
        taskTitle: string;
        requiredSkills: string[];
        reason: string
      }> = [];

      // Check for employees at full capacity
      const availableEmployeesStmt = db.prepare('SELECT COUNT(*) as count FROM employees WHERE capacity < 100');
      const availableEmployees = (availableEmployeesStmt.get() as { count: number }).count;

      for (const task of tasks) {
        if (!task.requiredSkills || task.requiredSkills.length === 0) continue;

        // Check if there are any qualified employees with capacity
        let hasQualifiedEmployee = false;

        for (const requirement of task.requiredSkills) {
          const stmt = db.prepare(`
            SELECT COUNT(DISTINCT e.id) as count
            FROM employees e
            INNER JOIN employee_skills es ON e.id = es.employeeId
            WHERE es.skillName = ?
              AND es.level >= ?
              AND e.capacity < 100
          `);
          const result = stmt.get(requirement.skillName, requirement.minLevel) as { count: number };

          if (result.count > 0) {
            hasQualifiedEmployee = true;
            break;
          }
        }

        if (!hasQualifiedEmployee) {
          const requiredSkillNames = task.requiredSkills.map(s => s.skillName);
          let reason = '';

          if (availableEmployees === 0) {
            reason = 'No employees with available capacity';
          } else {
            reason = 'No employees have the required skills at sufficient levels';
          }

          unassignable.push({
            taskId: task.id,
            taskTitle: task.title,
            requiredSkills: requiredSkillNames,
            reason
          });
        }
      }

      return unassignable;
    } catch (error) {
      console.error('Failed to get unassignable tasks:', error);
      throw new Error('Failed to retrieve unassignable tasks');
    }
  }
}
