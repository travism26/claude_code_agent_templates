'use client';

import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAnalyticsSummary } from '@/hooks/useAnalytics';
import { useGetEmployees } from '@/hooks/useEmployees';
import { useGetAssignments } from '@/hooks/useAssignments';

export default function Home() {
  const { data: summary, isLoading } = useAnalyticsSummary();
  const { data: employeesData } = useGetEmployees();
  const { data: assignmentsData } = useGetAssignments();

  const totalEmployees = employeesData?.pagination?.total || 0;
  const availableCapacity = employeesData?.employees?.reduce(
    (sum, emp) => sum + Math.max(0, emp.capacity - emp.workload),
    0
  ) || 0;
  const pendingAssignments = assignmentsData?.assignments?.filter((a) => a.status === 'proposed').length || 0;

  return (
    <Layout>
      <div>
        <h1 style={{ marginBottom: '16px', fontSize: '32px', fontWeight: '700' }}>
          Welcome to AI Task Prioritizer
        </h1>
        <p style={{ marginBottom: '32px', fontSize: '16px', color: '#6b7280' }}>
          Manage your tasks efficiently with AI-powered prioritization
        </p>

        {/* Quick Stats */}
        {!isLoading && summary && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Quick Stats</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                  {summary.total}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Tasks</div>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
                  {summary.pending}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending</div>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                  {summary.overdue}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Overdue</div>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' }}>
                  {summary.completed}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
                  {totalEmployees}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Employees</div>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                  {availableCapacity}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Available Capacity</div>
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
                  {pendingAssignments}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending Assignments</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Quick Links</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <Link
              href="/tasks"
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#3b82f6' }}>
                Manage Tasks
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Create, edit, and organize your tasks
              </p>
            </Link>

            <Link
              href="/analytics"
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#8b5cf6' }}>
                View Analytics
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                See insights and statistics about your tasks
              </p>
            </Link>

            <Link
              href="/employees"
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#8b5cf6' }}>
                Manage Employees
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                View and manage employee profiles and skills
              </p>
            </Link>

            <Link
              href="/assignments"
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#f59e0b' }}>
                View Assignments
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Track task assignments and match scores
              </p>
            </Link>

            <Link
              href="/audit"
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
                Audit Logs
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Track changes and history of your tasks
              </p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
