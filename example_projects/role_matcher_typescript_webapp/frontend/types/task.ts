export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  effort: number;
  importance: number;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string | null;
  effort: number;
  importance: number;
  category: string;
  status: TaskStatus;
}

export interface AuditLog {
  id: number;
  taskId: number | null;
  action: 'create' | 'update' | 'delete';
  userId: string | null;
  changes: string;
  timestamp: string;
}

export interface AIPrioritizationRequest {
  tasks: Task[];
}

export interface AIPrioritizationResponse {
  rerankedTasks: Array<{
    taskId: number;
    newPriority: number;
    justification: string;
  }>;
  missingSuggestions: string[];
  identifiedRisks: string[];
}

export interface AnalyticsCategoryCount {
  category: string;
  count: number;
}

export interface EffortDistribution {
  effort: number;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
}
