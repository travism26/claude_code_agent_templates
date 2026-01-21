'use client';

import {
  useSkillDistribution,
  useSkillGaps,
  useEmployeeUtilization,
  useAssignmentCompletionRate,
  useUnassignableTasks,
} from '@/hooks/useExtendedAnalytics';

export function ExtendedAnalytics() {
  const { data: skillDistribution, isLoading: loadingSkills } = useSkillDistribution();
  const { data: skillGaps, isLoading: loadingGaps } = useSkillGaps();
  const { data: utilization, isLoading: loadingUtilization } = useEmployeeUtilization();
  const { data: completionRate, isLoading: loadingCompletion } = useAssignmentCompletionRate();
  const { data: unassignableTasks, isLoading: loadingUnassignable } = useUnassignableTasks();

  const isLoading = loadingSkills || loadingGaps || loadingUtilization || loadingCompletion || loadingUnassignable;

  if (isLoading) {
    return <div data-testid="extended-analytics-loading">Loading team analytics...</div>;
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 40) return '#3b82f6';
    return '#22c55e';
  };

  return (
    <div data-testid="extended-analytics" style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Team Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Skill Distribution */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Skill Distribution
          </h3>
          {skillDistribution && skillDistribution.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {skillDistribution.slice(0, 10).map((skill) => (
                <div key={skill.skillName} data-testid={`skill-dist-${skill.skillName}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                    <span style={{ fontWeight: '500' }}>{skill.skillName}</span>
                    <span style={{ color: '#6b7280' }}>
                      {skill.employeeCount} {skill.employeeCount === 1 ? 'employee' : 'employees'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Avg Level: {skill.avgLevel.toFixed(1)} | Max: {skill.maxLevel} | Min: {skill.minLevel}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>No skill data available</div>
          )}
        </div>

        {/* Employee Utilization */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Employee Utilization
          </h3>
          {utilization && utilization.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {utilization.slice(0, 10).map((emp) => (
                <div key={emp.employeeId} data-testid={`util-${emp.employeeId}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                    <span style={{ fontWeight: '500' }}>{emp.employeeName}</span>
                    <span style={{ color: getUtilizationColor(emp.utilizationPercentage) }}>
                      {emp.utilizationPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(emp.utilizationPercentage, 100)}%`,
                        height: '100%',
                        backgroundColor: getUtilizationColor(emp.utilizationPercentage),
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {emp.workload}/{emp.capacity} ({emp.activeAssignments} active)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>No utilization data available</div>
          )}
        </div>

        {/* Assignment Completion Rate */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Assignment Completion Rate
          </h3>
          {completionRate ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total</div>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>{completionRate.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Proposed</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#f59e0b' }}>
                    {completionRate.proposed}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Accepted</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#22c55e' }}>
                    {completionRate.accepted}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Rejected</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#ef4444' }}>
                    {completionRate.rejected}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <strong>Acceptance Rate:</strong>{' '}
                  <span style={{ color: '#22c55e' }}>{completionRate.acceptanceRate.toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '14px' }}>
                  <strong>Rejection Rate:</strong>{' '}
                  <span style={{ color: '#ef4444' }}>{completionRate.rejectionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>No assignment data available</div>
          )}
        </div>

        {/* Skill Gaps */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Skill Gaps
          </h3>
          {skillGaps && skillGaps.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#ef4444' }}>
                {skillGaps.length} {skillGaps.length === 1 ? 'task has' : 'tasks have'} skill gaps
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflow: 'auto' }}>
                {skillGaps.map((gap) => (
                  <div
                    key={gap.taskId}
                    data-testid={`skill-gap-${gap.taskId}`}
                    style={{
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px' }}>
                      {gap.taskTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Available: {gap.availableEmployees} employees
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Required Skills:{' '}
                      {gap.requiredSkills.map((s) => `${s.skillName} (${s.minLevel})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: '#22c55e', fontSize: '14px' }}>
              ✓ No skill gaps! All tasks have qualified employees.
            </div>
          )}
        </div>

        {/* Unassignable Tasks */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Unassignable Tasks
          </h3>
          {unassignableTasks && unassignableTasks.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#ef4444' }}>
                {unassignableTasks.length} {unassignableTasks.length === 1 ? 'task cannot' : 'tasks cannot'} be assigned
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflow: 'auto' }}>
                {unassignableTasks.map((task) => (
                  <div
                    key={task.taskId}
                    data-testid={`unassignable-${task.taskId}`}
                    style={{
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px' }}>
                      {task.taskTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '4px' }}>
                      {task.reason}
                    </div>
                    {task.requiredSkills.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Requires: {task.requiredSkills.map((s) => `${s.skillName} (${s.minLevel})`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: '#22c55e', fontSize: '14px' }}>
              ✓ All tasks are assignable!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
