import { getDatabase } from '../config/database';
import { Employee, EmployeeSkill, PaginationParams } from '../types';

export class EmployeeModel {
  static findAll(params: PaginationParams & { role?: string } = {}): Employee[] {
    const db = getDatabase();
    const { page = 1, limit = 50, role } = params;

    let query = 'SELECT * FROM employees WHERE 1=1';
    const queryParams: any[] = [];

    if (role) {
      query += ' AND role = ?';
      queryParams.push(role);
    }

    query += ' ORDER BY name ASC';
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, (page - 1) * limit);

    const stmt = db.prepare(query);
    const employees = stmt.all(...queryParams) as Employee[];

    // Load skills for each employee
    return employees.map(emp => ({
      ...emp,
      skills: this.getSkills(emp.id)
    }));
  }

  static findById(id: number): Employee | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    const employee = stmt.get(id) as Employee | undefined;

    if (!employee) return null;

    // Load skills
    return {
      ...employee,
      skills: this.getSkills(id)
    };
  }

  static create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'skills'>): Employee {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO employees (name, role, capacity, workload)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      employee.name,
      employee.role,
      employee.capacity ?? 100,
      employee.workload ?? 0
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, updates: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'skills'>>): Employee | null {
    const db = getDatabase();
    const existingEmployee = this.findById(id);
    if (!existingEmployee) return null;

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'skills') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return existingEmployee;

    fields.push(`updatedAt = ?`);
    values.push(new Date().toISOString());
    values.push(id);

    const query = `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static count(filters: { role?: string } = {}): number {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as count FROM employees WHERE 1=1';
    const queryParams: any[] = [];

    if (filters.role) {
      query += ' AND role = ?';
      queryParams.push(filters.role);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...queryParams) as { count: number };
    return result.count;
  }

  static addSkill(employeeId: number, skillName: string, level: number): EmployeeSkill {
    const db = getDatabase();

    // Check if employee exists
    const employee = this.findById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Check for duplicate
    const existing = db.prepare(
      'SELECT * FROM employee_skills WHERE employeeId = ? AND skillName = ?'
    ).get(employeeId, skillName);

    if (existing) {
      throw new Error(`Employee already has skill: ${skillName}`);
    }

    const stmt = db.prepare(`
      INSERT INTO employee_skills (employeeId, skillName, level)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(employeeId, skillName, level);

    return db.prepare('SELECT * FROM employee_skills WHERE id = ?')
      .get(result.lastInsertRowid) as EmployeeSkill;
  }

  static updateSkill(employeeId: number, skillName: string, level: number): EmployeeSkill | null {
    const db = getDatabase();

    // Check if skill exists
    const existing = db.prepare(
      'SELECT * FROM employee_skills WHERE employeeId = ? AND skillName = ?'
    ).get(employeeId, skillName);

    if (!existing) {
      throw new Error(`Employee does not have skill: ${skillName}`);
    }

    const stmt = db.prepare(`
      UPDATE employee_skills
      SET level = ?, updatedAt = ?
      WHERE employeeId = ? AND skillName = ?
    `);

    stmt.run(level, new Date().toISOString(), employeeId, skillName);

    return db.prepare('SELECT * FROM employee_skills WHERE employeeId = ? AND skillName = ?')
      .get(employeeId, skillName) as EmployeeSkill;
  }

  static removeSkill(employeeId: number, skillName: string): boolean {
    const db = getDatabase();

    // Check if skill exists
    const existing = db.prepare(
      'SELECT * FROM employee_skills WHERE employeeId = ? AND skillName = ?'
    ).get(employeeId, skillName);

    if (!existing) {
      throw new Error(`Employee does not have skill: ${skillName}`);
    }

    const stmt = db.prepare('DELETE FROM employee_skills WHERE employeeId = ? AND skillName = ?');
    const result = stmt.run(employeeId, skillName);
    return result.changes > 0;
  }

  static getSkills(employeeId: number): Array<{ skillName: string; level: number }> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT skillName, level FROM employee_skills WHERE employeeId = ? ORDER BY skillName');
    return stmt.all(employeeId) as Array<{ skillName: string; level: number }>;
  }

  static updateWorkload(employeeId: number, workload: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE employees SET workload = ?, updatedAt = ? WHERE id = ?');
    const result = stmt.run(workload, new Date().toISOString(), employeeId);
    return result.changes > 0;
  }

  static findBySkill(skillName: string, minLevel?: number): Employee[] {
    const db = getDatabase();

    let query = `
      SELECT DISTINCT e.*
      FROM employees e
      INNER JOIN employee_skills es ON e.id = es.employeeId
      WHERE es.skillName = ?
    `;
    const queryParams: any[] = [skillName];

    if (minLevel !== undefined) {
      query += ' AND es.level >= ?';
      queryParams.push(minLevel);
    }

    query += ' ORDER BY e.name ASC';

    const stmt = db.prepare(query);
    const employees = stmt.all(...queryParams) as Employee[];

    // Load skills for each employee
    return employees.map(emp => ({
      ...emp,
      skills: this.getSkills(emp.id)
    }));
  }
}
