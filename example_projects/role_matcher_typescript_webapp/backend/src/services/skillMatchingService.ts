import { EmployeeModel } from '../models/Employee';
import { TaskModel } from '../models/Task';
import { SkillRequirement, SkillMatch, MatchResult } from '../types';

export class SkillMatchingService {
  /**
   * Calculate match score between employee skills and task requirements
   * Returns a score from 0-100
   */
  calculateMatchScore(
    employeeSkills: Array<{ skillName: string; level: number }>,
    taskRequirements: SkillRequirement[]
  ): number {
    if (!taskRequirements || taskRequirements.length === 0) {
      return 100; // If no requirements, all employees match perfectly
    }

    if (!employeeSkills || employeeSkills.length === 0) {
      return 0; // No skills = no match
    }

    let totalScore = 0;
    let matchedSkills = 0;

    for (const requirement of taskRequirements) {
      const employeeSkill = employeeSkills.find(s => s.skillName === requirement.skillName);

      if (employeeSkill) {
        if (employeeSkill.level >= requirement.minLevel) {
          // Employee meets requirement
          matchedSkills++;

          // Base score for meeting requirement
          let skillScore = 1.0;

          // Bonus for overqualification (0.1 per extra level)
          const extraLevels = employeeSkill.level - requirement.minLevel;
          skillScore += extraLevels * 0.1;

          totalScore += skillScore;
        }
        // If employee has skill but below required level, no score
      }
      // If employee doesn't have the skill at all, no score
    }

    // Calculate percentage
    const baseScore = (matchedSkills / taskRequirements.length) * 100;

    // Add bonus points for overqualification (capped at 100)
    const bonusScore = ((totalScore - matchedSkills) / taskRequirements.length) * 10;

    return Math.min(100, baseScore + bonusScore);
  }

  /**
   * Get detailed match breakdown showing skill-by-skill analysis
   */
  getDetailedMatch(
    employeeSkills: Array<{ skillName: string; level: number }>,
    taskRequirements: SkillRequirement[]
  ): SkillMatch[] {
    if (!taskRequirements || taskRequirements.length === 0) {
      return [];
    }

    return taskRequirements.map(requirement => {
      const employeeSkill = employeeSkills?.find(s => s.skillName === requirement.skillName);

      const employeeLevel = employeeSkill ? employeeSkill.level : null;
      const match = employeeLevel !== null && employeeLevel >= requirement.minLevel;

      // Calculate individual skill score
      let score = 0;
      if (match && employeeLevel !== null) {
        score = 1.0 + ((employeeLevel - requirement.minLevel) * 0.1);
      }

      return {
        skillName: requirement.skillName,
        required: requirement.minLevel,
        employeeLevel,
        match,
        score
      };
    });
  }

  /**
   * Find best matching employees for a task
   * Returns top N employees sorted by match score
   * Excludes employees at 100% utilization (workload/capacity)
   */
  async findBestMatches(taskId: number, limit: number = 10): Promise<MatchResult[]> {
    const task = TaskModel.findById(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const taskRequirements = task.requiredSkills || [];

    // Get all employees
    const allEmployees = EmployeeModel.findAll({ limit: 1000 });

    // Calculate match for each employee
    const matches: MatchResult[] = allEmployees
      .filter(emp => (emp.workload / emp.capacity * 100) < 100) // Exclude employees at full utilization
      .map(employee => {
        const matchScore = this.calculateMatchScore(employee.skills || [], taskRequirements);
        const skillMatches = this.getDetailedMatch(employee.skills || [], taskRequirements);
        const missingSkills = skillMatches
          .filter(m => !m.match)
          .map(m => m.skillName);

        let recommendation = '';
        if (matchScore === 100) {
          recommendation = 'Perfect match - employee meets all requirements';
        } else if (matchScore >= 75) {
          recommendation = 'Strong match - employee is well-qualified';
        } else if (matchScore >= 50) {
          recommendation = 'Moderate match - employee has some required skills';
        } else if (matchScore > 0) {
          recommendation = 'Weak match - employee has limited required skills';
        } else {
          recommendation = 'No match - employee lacks required skills';
        }

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          matchScore,
          skillMatches,
          missingSkills,
          recommendation
        };
      });

    // Sort by match score (descending), then by workload (ascending) as tiebreaker
    matches.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Tiebreaker: prefer employees with lower workload
      const empA = allEmployees.find(e => e.id === a.employeeId);
      const empB = allEmployees.find(e => e.id === b.employeeId);
      return (empA?.workload || 0) - (empB?.workload || 0);
    });

    // Return top N matches
    return matches.slice(0, limit);
  }

  /**
   * Check if employee is qualified (meets all requirements)
   */
  isQualified(
    employeeSkills: Array<{ skillName: string; level: number }>,
    taskRequirements: SkillRequirement[]
  ): boolean {
    if (!taskRequirements || taskRequirements.length === 0) {
      return true; // No requirements = everyone qualifies
    }

    if (!employeeSkills || employeeSkills.length === 0) {
      return false; // No skills = not qualified
    }

    // Check that every requirement is met
    return taskRequirements.every(requirement => {
      const employeeSkill = employeeSkills.find(s => s.skillName === requirement.skillName);
      return employeeSkill && employeeSkill.level >= requirement.minLevel;
    });
  }
}
