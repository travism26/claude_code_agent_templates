'use client';

import { useState } from 'react';
import { useAuditLogs, useTaskAuditLogs } from '@/hooks/useAudit';

export function AuditLog() {
  const [taskIdFilter, setTaskIdFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const taskId = taskIdFilter ? parseInt(taskIdFilter) : null;

  const { data: allLogsData, isLoading: allLogsLoading, error: allLogsError } = useAuditLogs(
    { page, limit },
  );

  const { data: taskLogsData, isLoading: taskLogsLoading, error: taskLogsError } = useTaskAuditLogs(
    taskId || 0,
    { page, limit },
  );

  const data = taskId ? taskLogsData : allLogsData;
  const isLoading = taskId ? taskLogsLoading : allLogsLoading;
  const error = taskId ? taskLogsError : allLogsError;

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const actionColors = {
    create: '#22c55e',
    update: '#f59e0b',
    delete: '#ef4444',
  };

  const actionLabels = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.pages) setPage(page + 1);
  };

  if (isLoading) {
    return <div data-testid="audit-loading">Loading audit logs...</div>;
  }

  if (error) {
    return (
      <div data-testid="audit-error" style={{ color: '#ef4444' }}>
        Error loading audit logs: {error.message}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '700' }}>Audit Logs</h1>

      {/* Filter */}
      <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <label htmlFor="taskIdFilter" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          Filter by Task ID
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            id="taskIdFilter"
            type="number"
            value={taskIdFilter}
            onChange={(e) => setTaskIdFilter(e.target.value)}
            placeholder="Enter task ID"
            data-testid="task-id-filter"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <button
            onClick={() => {
              setTaskIdFilter('');
              setPage(1);
            }}
            data-testid="clear-filter-btn"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Audit Logs */}
      <div data-testid="audit-log-list">
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#6b7280' }}>No audit logs found.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {logs.map((log, index) => (
              <div
                key={log.id}
                data-testid={`audit-log-${log.id}`}
                style={{
                  padding: '16px',
                  borderBottom: index < logs.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span
                      style={{
                        backgroundColor: actionColors[log.action],
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {actionLabels[log.action]}
                    </span>
                    {log.taskId && (
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Task #{log.taskId}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                {log.changes && (
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      backgroundColor: '#f9fafb',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {log.changes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div
          data-testid="audit-pagination"
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            data-testid="prev-page-btn"
            style={{
              padding: '8px 16px',
              backgroundColor: page <= 1 ? '#e5e7eb' : '#3b82f6',
              color: page <= 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= pagination.pages}
            data-testid="next-page-btn"
            style={{
              padding: '8px 16px',
              backgroundColor: page >= pagination.pages ? '#e5e7eb' : '#3b82f6',
              color: page >= pagination.pages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page >= pagination.pages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
