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
  requiredSkills?: SkillRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  taskId: number | null;
  action: 'create' | 'update' | 'delete';
  userId: string | null;
  changes: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: keyof Task;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskFilters {
  status?: string;
  category?: string;
  minPriority?: number;
  maxPriority?: number;
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SkillRequirement {
  skillName: string;
  minLevel: number;
}

export interface EmployeeSkill {
  id: number;
  employeeId: number;
  skillName: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  capacity: number;
  workload: number;
  skills?: Array<{ skillName: string; level: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  taskId: number;
  employeeId: number;
  score: number;
  status: 'proposed' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface SkillMatch {
  skillName: string;
  required: number;
  employeeLevel: number | null;
  match: boolean;
  score: number;
}

export interface MatchResult {
  employeeId: number;
  employeeName: string;
  matchScore: number;
  skillMatches: SkillMatch[];
  missingSkills: string[];
  recommendation: string;
}
