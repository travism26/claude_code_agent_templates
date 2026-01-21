'use client';

import { Layout } from '@/components/Layout';
import { EmployeeList } from '@/components/EmployeeList';

export default function EmployeesPage() {
  return (
    <Layout>
      <div data-testid="employees-page">
        <EmployeeList />
      </div>
    </Layout>
  );
}
