'use client';

import { Layout } from '@/components/Layout';
import { TaskList } from '@/components/TaskList';
import { AIPrioritize } from '@/components/AIPrioritize';

export default function TasksPage() {
  return (
    <Layout>
      <div>
        <TaskList />
        <div style={{ marginTop: '40px' }}>
          <AIPrioritize />
        </div>
      </div>
    </Layout>
  );
}
