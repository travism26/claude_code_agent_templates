'use client';

import { useAnalyticsSummary, useCategoryCount, useEffortDistribution } from '@/hooks/useAnalytics';

export function Analytics() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useAnalyticsSummary();
  const { data: categoryCount, isLoading: categoryLoading, error: categoryError } = useCategoryCount();
  const { data: effortDistribution, isLoading: effortLoading, error: effortError } = useEffortDistribution();

  if (summaryLoading || categoryLoading || effortLoading) {
    return <div data-testid="analytics-loading">Loading analytics...</div>;
  }

  if (summaryError || categoryError || effortError) {
    return (
      <div data-testid="analytics-error" style={{ color: '#ef4444' }}>
        Error loading analytics: {summaryError?.message || categoryError?.message || effortError?.message}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '700' }}>Analytics Dashboard</h1>

      {/* Summary Statistics */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Task Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div
            data-testid="analytics-total"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
              {summary?.total || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Tasks</div>
          </div>

          <div
            data-testid="analytics-pending"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
              {summary?.pending || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending</div>
          </div>

          <div
            data-testid="analytics-inprogress"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
              {summary?.inProgress || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>In Progress</div>
          </div>

          <div
            data-testid="analytics-completed"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' }}>
              {summary?.completed || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
          </div>

          <div
            data-testid="analytics-overdue"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
              {summary?.overdue || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Overdue</div>
          </div>

          <div
            data-testid="analytics-duetoday"
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#06b6d4', marginBottom: '4px' }}>
              {summary?.dueToday || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Due Today</div>
          </div>
        </div>
      </div>

      {/* Category Count */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Tasks by Category</h2>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {categoryCount && categoryCount.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {categoryCount.map((item) => (
                <div key={item.category} data-testid={`category-${item.category}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{item.category}</span>
                  <span style={{ backgroundColor: '#e5e7eb', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: '#6b7280' }}>No category data available</p>
          )}
        </div>
      </div>

      {/* Effort Distribution */}
      <div>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Effort Distribution</h2>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {effortDistribution && effortDistribution.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {effortDistribution.map((item) => (
                <div key={item.effort} data-testid={`effort-${item.effort}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontWeight: '500' }}>Effort Level {item.effort}</span>
                  <span style={{ backgroundColor: '#e5e7eb', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                    {item.count} tasks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: '#6b7280' }}>No effort distribution data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
