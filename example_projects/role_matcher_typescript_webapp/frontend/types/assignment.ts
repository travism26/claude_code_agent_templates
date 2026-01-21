export interface Assignment {
  id: number;
  taskId: number;
  employeeId: number;
  score: number;
  status: 'proposed' | 'accepted' | 'rejected';
  timestamp: string;
}

export type AssignmentStatus = 'proposed' | 'accepted' | 'rejected';

export interface AssignmentFormData {
  taskId: number;
  employeeId: number;
  score: number;
  status?: AssignmentStatus;
}

export interface AssignmentStatusUpdate {
  status: AssignmentStatus;
}

export interface SkillMatch {
  skillName: string;
  required: number;
  employeeLevel: number | null;
  match: boolean;
  score: number;
}

export interface Recommendation {
  employeeId: number;
  employeeName: string;
  employeeRole: string;
  capacity: number;
  workload: number;
  matchScore: number;
  skillMatches: SkillMatch[];
  missingSkills: string[];
  recommendation: string;
}
