export interface SkillDistribution {
  skillName: string;
  employeeCount: number;
  avgLevel: number;
  maxLevel: number;
  minLevel: number;
}

export interface SkillGap {
  taskId: number;
  taskTitle: string;
  requiredSkills: Array<{
    skillName: string;
    minLevel: number;
  }>;
  availableEmployees: number;
}

export interface EmployeeUtilization {
  employeeId: number;
  employeeName: string;
  role: string;
  capacity: number;
  workload: number;
  utilizationPercentage: number;
  activeAssignments: number;
}

export interface AssignmentStats {
  total: number;
  proposed: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  rejectionRate: number;
}

export interface UnassignableTask {
  taskId: number;
  taskTitle: string;
  requiredSkills: Array<{
    skillName: string;
    minLevel: number;
  }>;
  reason: string;
}
