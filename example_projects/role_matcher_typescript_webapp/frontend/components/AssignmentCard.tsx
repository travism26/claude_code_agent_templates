'use client';

import { Assignment } from '@/types/assignment';

interface AssignmentCardProps {
  assignment: Assignment;
  taskTitle?: string;
  employeeName?: string;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function AssignmentCard({ assignment, taskTitle, employeeName, onAccept, onReject, onDelete }: AssignmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#22c55e'; // green
      case 'rejected':
        return '#ef4444'; // red
      case 'proposed':
        return '#f59e0b'; // orange
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'proposed':
        return 'Proposed';
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green - excellent match
    if (score >= 60) return '#3b82f6'; // blue - good match
    if (score >= 40) return '#f59e0b'; // orange - moderate match
    return '#ef4444'; // red - poor match
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div
      data-testid={`assignment-card-${assignment.id}`}
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
          {taskTitle && (
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
              Task: {taskTitle}
            </h4>
          )}
          {employeeName && (
            <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
              Employee: {employeeName}
            </p>
          )}
        </div>
        <div
          style={{
            backgroundColor: getStatusColor(assignment.status),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '12px',
          }}
          data-testid={`assignment-status-${assignment.id}`}
        >
          {getStatusText(assignment.status)}
        </div>
      </div>

      {/* Match Score */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
          <span><strong>Match Score:</strong></span>
          <span style={{ color: getScoreColor(assignment.score), fontWeight: '600' }}>
            {assignment.score.toFixed(0)}%
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
          data-testid={`assignment-score-bar-${assignment.id}`}
        >
          <div
            style={{
              width: `${Math.min(assignment.score, 100)}%`,
              height: '100%',
              backgroundColor: getScoreColor(assignment.score),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Timestamp */}
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
        Created: {formatTimestamp(assignment.timestamp)}
      </div>

      {/* Action Buttons */}
      {(onAccept || onReject || onDelete) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {assignment.status === 'proposed' && onAccept && (
            <button
              data-testid={`assignment-accept-btn-${assignment.id}`}
              onClick={() => onAccept(assignment.id)}
              style={{
                padding: '6px 16px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Accept
            </button>
          )}
          {assignment.status === 'proposed' && onReject && (
            <button
              data-testid={`assignment-reject-btn-${assignment.id}`}
              onClick={() => onReject(assignment.id)}
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
              Reject
            </button>
          )}
          {onDelete && (
            <button
              data-testid={`assignment-delete-btn-${assignment.id}`}
              onClick={() => onDelete(assignment.id)}
              style={{
                padding: '6px 16px',
                backgroundColor: '#6b7280',
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
