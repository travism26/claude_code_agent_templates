import { getDatabase } from '../config/database';
import { Task, PaginationParams, SortParams, TaskFilters, SkillRequirement } from '../types';

export class TaskModel {
  static findAll(
    params: PaginationParams & SortParams & TaskFilters = {}
  ): Task[] {
    const db = getDatabase();
    const {
      page = 1,
      limit = 50,
      sortBy = 'priority',
      sortOrder = 'desc',
      status,
      category,
      minPriority,
      maxPriority
    } = params;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const queryParams: any[] = [];

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      queryParams.push(category);
    }

    if (minPriority !== undefined) {
      query += ' AND priority >= ?';
      queryParams.push(minPriority);
    }

    if (maxPriority !== undefined) {
      query += ' AND priority <= ?';
      queryParams.push(maxPriority);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, (page - 1) * limit);

    const stmt = db.prepare(query);
    const tasks = stmt.all(...queryParams) as any[];

    // Parse requiredSkills JSON
    return tasks.map(task => ({
      ...task,
      requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : undefined
    })) as Task[];
  }

  static findById(id: number): Task | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(id) as any;

    if (!task) return null;

    // Parse requiredSkills JSON
    return {
      ...task,
      requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : undefined
    } as Task;
  }

  static create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, dueDate, effort, importance, category, status, priority, requiredSkills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      task.title,
      task.description,
      task.dueDate,
      task.effort,
      task.importance,
      task.category,
      task.status,
      task.priority,
      task.requiredSkills ? JSON.stringify(task.requiredSkills) : null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task | null {
    const db = getDatabase();
    const existingTask = this.findById(id);
    if (!existingTask) return null;

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        if (key === 'requiredSkills') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return existingTask;

    fields.push(`updatedAt = ?`);
    values.push(new Date().toISOString());
    values.push(id);

    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static count(filters: TaskFilters = {}): number {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM tasks WHERE 1=1';
    const queryParams: any[] = [];

    if (filters.status) {
      query += ' AND status = ?';
      queryParams.push(filters.status);
    }

    if (filters.category) {
      query += ' AND category = ?';
      queryParams.push(filters.category);
    }

    if (filters.minPriority !== undefined) {
      query += ' AND priority >= ?';
      queryParams.push(filters.minPriority);
    }

    if (filters.maxPriority !== undefined) {
      query += ' AND priority <= ?';
      queryParams.push(filters.maxPriority);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...queryParams) as { count: number };
    return result.count;
  }

  static findOverdue(): Task[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM tasks
      WHERE dueDate IS NOT NULL
        AND dueDate < datetime('now')
        AND status != 'completed'
      ORDER BY dueDate ASC
    `);
    return stmt.all() as Task[];
  }

  static findDueToday(): Task[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM tasks
      WHERE date(dueDate) = date('now')
        AND status != 'completed'
      ORDER BY priority DESC
    `);
    return stmt.all() as Task[];
  }

  static getCategoryCounts(): Array<{ category: string; count: number }> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM tasks
      GROUP BY category
      ORDER BY count DESC
    `);
    return stmt.all() as Array<{ category: string; count: number }>;
  }

  static getEffortDistribution(): Array<{ effort: number; count: number }> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT effort, COUNT(*) as count
      FROM tasks
      GROUP BY effort
      ORDER BY effort ASC
    `);
    return stmt.all() as Array<{ effort: number; count: number }>;
  }

  static findTasksRequiringSkill(skillName: string): Task[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tasks WHERE requiredSkills IS NOT NULL');
    const tasks = stmt.all() as any[];

    // Filter tasks that require the specified skill
    return tasks
      .map(task => ({
        ...task,
        requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : undefined
      }))
      .filter(task => {
        if (!task.requiredSkills) return false;
        return task.requiredSkills.some((req: SkillRequirement) => req.skillName === skillName);
      }) as Task[];
  }
}
