'use client';

import { useState } from 'react';
import { AssignmentStatus } from '@/types/assignment';
import { useGetAssignments, useUpdateAssignmentStatus, useDeleteAssignment } from '@/hooks/useAssignments';
import { AssignmentCard } from './AssignmentCard';

export function AssignmentList() {
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');
  const [taskIdFilter, setTaskIdFilter] = useState<string>('');
  const [employeeIdFilter, setEmployeeIdFilter] = useState<string>('');

  const { data, isLoading, error } = useGetAssignments({
    status: statusFilter || undefined,
    taskId: taskIdFilter ? parseInt(taskIdFilter) : undefined,
    employeeId: employeeIdFilter ? parseInt(employeeIdFilter) : undefined,
  });

  const updateStatus = useUpdateAssignmentStatus();
  const deleteAssignment = useDeleteAssignment();

  const handleAccept = async (id: number) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'accepted' });
    } catch (error) {
      console.error('Error accepting assignment:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting assignment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  if (isLoading) {
    return <div data-testid="loading">Loading assignments...</div>;
  }

  if (error) {
    return <div data-testid="error" style={{ color: '#ef4444' }}>Error loading assignments: {error.message}</div>;
  }

  const assignments = data?.assignments || [];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Assignments</h1>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Filter by Status
          </label>
          <select
            id="statusFilter"
            data-testid="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | '')}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="taskIdFilter" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Filter by Task ID
          </label>
          <input
            id="taskIdFilter"
            type="text"
            data-testid="task-id-filter"
            value={taskIdFilter}
            onChange={(e) => setTaskIdFilter(e.target.value)}
            placeholder="Enter task ID"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="employeeIdFilter" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Filter by Employee ID
          </label>
          <input
            id="employeeIdFilter"
            type="text"
            data-testid="employee-id-filter"
            value={employeeIdFilter}
            onChange={(e) => setEmployeeIdFilter(e.target.value)}
            placeholder="Enter employee ID"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div data-testid="no-assignments" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          {statusFilter || taskIdFilter || employeeIdFilter
            ? 'No assignments match your filters'
            : 'No assignments yet. Assignments will appear here when tasks are matched to employees.'}
        </div>
      ) : (
        <div data-testid="assignments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              taskTitle={`Task #${assignment.taskId}`}
              employeeName={`Employee #${assignment.employeeId}`}
              onAccept={handleAccept}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {data?.pagination && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          Showing {assignments.length} of {data.pagination.total} assignments
        </div>
      )}
    </div>
  );
}
