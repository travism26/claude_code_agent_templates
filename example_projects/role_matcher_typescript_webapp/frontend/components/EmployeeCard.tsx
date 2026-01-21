'use client';

import { Employee } from '@/types/employee';

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete, onViewDetails }: EmployeeCardProps) {
  const utilizationPercentage = employee.capacity > 0 ? (employee.workload / employee.capacity) * 100 : 0;
  const availableCapacity = Math.max(0, employee.capacity - employee.workload);

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444'; // red - at/over capacity
    if (percentage >= 70) return '#f59e0b'; // orange - high utilization
    if (percentage >= 40) return '#3b82f6'; // blue - moderate utilization
    return '#22c55e'; // green - low utilization
  };

  return (
    <div
      data-testid={`employee-card-${employee.id}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
            {employee.name}
          </h3>
          <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
            {employee.role}
          </p>
        </div>
      </div>

      {/* Capacity and Workload */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
          <span><strong>Capacity:</strong> {employee.workload}/{employee.capacity}</span>
          <span style={{ color: getUtilizationColor(utilizationPercentage) }}>
            {utilizationPercentage.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
          data-testid={`employee-capacity-bar-${employee.id}`}
        >
          <div
            style={{
              width: `${Math.min(utilizationPercentage, 100)}%`,
              height: '100%',
              backgroundColor: getUtilizationColor(utilizationPercentage),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
          Available: {availableCapacity}
        </div>
      </div>

      {/* Skills */}
      {employee.skills && employee.skills.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ fontSize: '14px' }}>Skills:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
            {employee.skills.map((skill) => (
              <span
                key={skill.skillName}
                data-testid={`employee-skill-${employee.id}-${skill.skillName}`}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              >
                {skill.skillName} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(onEdit || onDelete || onViewDetails) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {onViewDetails && (
            <button
              data-testid={`employee-view-btn-${employee.id}`}
              onClick={() => onViewDetails(employee)}
              style={{
                padding: '6px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              View Details
            </button>
          )}
          {onEdit && (
            <button
              data-testid={`employee-edit-btn-${employee.id}`}
              onClick={() => onEdit(employee)}
              style={{
                padding: '6px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              data-testid={`employee-delete-btn-${employee.id}`}
              onClick={() => onDelete(employee.id)}
              style={{
                padding: '6px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
