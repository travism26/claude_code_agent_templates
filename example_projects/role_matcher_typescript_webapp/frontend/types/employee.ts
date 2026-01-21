export interface EmployeeSkill {
  skillName: string;
  level: number;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  capacity: number;
  workload: number;
  skills?: EmployeeSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  role: string;
  capacity: number;
}

export interface SkillFormData {
  skillName: string;
  level: number;
}

export interface SkillSearchParams {
  skillName: string;
  minLevel?: number;
}

export interface SkillSearchResult {
  employees: Employee[];
}
