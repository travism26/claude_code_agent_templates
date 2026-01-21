'use client';

import { Layout } from '@/components/Layout';
import { AssignmentList } from '@/components/AssignmentList';

export default function AssignmentsPage() {
  return (
    <Layout>
      <div data-testid="assignments-page">
        <AssignmentList />
      </div>
    </Layout>
  );
}
