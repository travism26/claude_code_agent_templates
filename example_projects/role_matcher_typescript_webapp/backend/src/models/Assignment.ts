import { getDatabase } from '../config/database';
import { Assignment, PaginationParams } from '../types';

export interface AssignmentFilters {
  taskId?: number;
  employeeId?: number;
  status?: 'proposed' | 'accepted' | 'rejected';
}

export class AssignmentModel {
  static findAll(params: PaginationParams & AssignmentFilters = {}): Assignment[] {
    const db = getDatabase();
    const { page = 1, limit = 50, taskId, employeeId, status } = params;

    let query = 'SELECT * FROM assignments WHERE 1=1';
    const queryParams: any[] = [];

    if (taskId !== undefined) {
      query += ' AND taskId = ?';
      queryParams.push(taskId);
    }

    if (employeeId !== undefined) {
      query += ' AND employeeId = ?';
      queryParams.push(employeeId);
    }

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY score DESC, timestamp DESC';
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, (page - 1) * limit);

    const stmt = db.prepare(query);
    return stmt.all(...queryParams) as Assignment[];
  }

  static findById(id: number): Assignment | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM assignments WHERE id = ?');
    return (stmt.get(id) as Assignment) || null;
  }

  static create(assignment: Omit<Assignment, 'id' | 'timestamp'>): Assignment {
    const db = getDatabase();

    // Check for duplicate assignment
    const existing = db.prepare(
      'SELECT * FROM assignments WHERE taskId = ? AND employeeId = ?'
    ).get(assignment.taskId, assignment.employeeId);

    if (existing) {
      throw new Error(`Assignment already exists for task ${assignment.taskId} and employee ${assignment.employeeId}`);
    }

    const stmt = db.prepare(`
      INSERT INTO assignments (taskId, employeeId, score, status)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      assignment.taskId,
      assignment.employeeId,
      assignment.score,
      assignment.status || 'proposed'
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, updates: Partial<Omit<Assignment, 'id' | 'timestamp' | 'taskId' | 'employeeId'>>): Assignment | null {
    const db = getDatabase();
    const existingAssignment = this.findById(id);
    if (!existingAssignment) return null;

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'timestamp' && key !== 'taskId' && key !== 'employeeId') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return existingAssignment;

    values.push(id);

    const query = `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM assignments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static count(filters: AssignmentFilters = {}): number {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM assignments WHERE 1=1';
    const queryParams: any[] = [];

    if (filters.taskId !== undefined) {
      query += ' AND taskId = ?';
      queryParams.push(filters.taskId);
    }

    if (filters.employeeId !== undefined) {
      query += ' AND employeeId = ?';
      queryParams.push(filters.employeeId);
    }

    if (filters.status) {
      query += ' AND status = ?';
      queryParams.push(filters.status);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...queryParams) as { count: number };
    return result.count;
  }

  static findByTask(taskId: number): Assignment[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM assignments WHERE taskId = ? ORDER BY score DESC');
    return stmt.all(taskId) as Assignment[];
  }

  static findByEmployee(employeeId: number): Assignment[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM assignments WHERE employeeId = ? ORDER BY timestamp DESC');
    return stmt.all(employeeId) as Assignment[];
  }

  static getActiveAssignments(employeeId: number): Assignment[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM assignments WHERE employeeId = ? AND status = ? ORDER BY timestamp DESC');
    return stmt.all(employeeId, 'accepted') as Assignment[];
  }
}
