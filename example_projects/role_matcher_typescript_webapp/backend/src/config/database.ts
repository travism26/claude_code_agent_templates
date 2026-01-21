import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || './data/tasks.db';
    const dbDir = path.dirname(dbPath);

    // Ensure the directory exists (skip for in-memory databases)
    if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = OFF'); // Disable foreign key constraints for simplicity

    initializeTables();
  }

  return db;
}

function initializeTables(): void {
  if (!db) return;

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      dueDate TEXT,
      effort INTEGER NOT NULL CHECK(effort >= 1 AND effort <= 5),
      importance INTEGER NOT NULL CHECK(importance >= 1 AND importance <= 5),
      category TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'completed')),
      priority REAL NOT NULL DEFAULT 0,
      requiredSkills TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create audit_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER,
      action TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete')),
      userId TEXT,
      changes TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (taskId) REFERENCES tasks(id)
    )
  `);

  // Create employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      capacity REAL NOT NULL DEFAULT 100 CHECK(capacity >= 0 AND capacity <= 100),
      workload INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create employee_skills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employee_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER NOT NULL,
      skillName TEXT NOT NULL,
      level INTEGER NOT NULL CHECK(level >= 1 AND level <= 5),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE(employeeId, skillName)
    )
  `);

  // Create assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER NOT NULL,
      employeeId INTEGER NOT NULL,
      score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
      status TEXT NOT NULL CHECK(status IN ('proposed', 'accepted', 'rejected')) DEFAULT 'proposed',
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE(taskId, employeeId)
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_audit_taskId ON audit_logs(taskId);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
    CREATE INDEX IF NOT EXISTS idx_employees_capacity ON employees(capacity);
    CREATE INDEX IF NOT EXISTS idx_employee_skills_employeeId ON employee_skills(employeeId);
    CREATE INDEX IF NOT EXISTS idx_employee_skills_skillName ON employee_skills(skillName);
    CREATE INDEX IF NOT EXISTS idx_employee_skills_level ON employee_skills(level);
    CREATE INDEX IF NOT EXISTS idx_assignments_taskId ON assignments(taskId);
    CREATE INDEX IF NOT EXISTS idx_assignments_employeeId ON assignments(employeeId);
    CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDatabase(): void {
  const database = getDatabase();

  // Clear all data and reset tables (in reverse order of dependencies)
  database.exec('DROP TABLE IF EXISTS assignments');
  database.exec('DROP TABLE IF EXISTS employee_skills');
  database.exec('DROP TABLE IF EXISTS employees');
  database.exec('DROP TABLE IF EXISTS audit_logs');
  database.exec('DROP TABLE IF EXISTS tasks');

  initializeTables();
}
