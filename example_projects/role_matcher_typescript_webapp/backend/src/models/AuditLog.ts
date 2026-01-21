import { getDatabase } from '../config/database';
import { AuditLog } from '../types';

export class AuditLogModel {
  static create(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (taskId, action, userId, changes)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      log.taskId,
      log.action,
      log.userId,
      log.changes
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): AuditLog | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM audit_logs WHERE id = ?');
    return (stmt.get(id) as AuditLog) || null;
  }

  static findAll(params: {
    page?: number;
    limit?: number;
    taskId?: number;
    action?: string;
  } = {}): AuditLog[] {
    const db = getDatabase();
    const { page = 1, limit = 50, taskId, action } = params;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const queryParams: any[] = [];

    if (taskId !== undefined) {
      query += ' AND taskId = ?';
      queryParams.push(taskId);
    }

    if (action) {
      query += ' AND action = ?';
      queryParams.push(action);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, (page - 1) * limit);

    const stmt = db.prepare(query);
    return stmt.all(...queryParams) as AuditLog[];
  }

  static findByTaskId(taskId: number): AuditLog[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE taskId = ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(taskId) as AuditLog[];
  }

  static count(filters: { taskId?: number; action?: string } = {}): number {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const queryParams: any[] = [];

    if (filters.taskId !== undefined) {
      query += ' AND taskId = ?';
      queryParams.push(filters.taskId);
    }

    if (filters.action) {
      query += ' AND action = ?';
      queryParams.push(filters.action);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...queryParams) as { count: number };
    return result.count;
  }
}
