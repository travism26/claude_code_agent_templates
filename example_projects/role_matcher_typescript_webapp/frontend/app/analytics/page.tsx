'use client';

import { Layout } from '@/components/Layout';
import { Analytics } from '@/components/Analytics';
import { ExtendedAnalytics } from '@/components/ExtendedAnalytics';

export default function AnalyticsPage() {
  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Task Analytics</h2>
        <Analytics />
      </div>
      <ExtendedAnalytics />
    </Layout>
  );
}
