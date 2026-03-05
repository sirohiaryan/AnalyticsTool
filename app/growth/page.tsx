'use client';

import { useEffect, useState } from 'react';
import ViewerGrowthChart from '@/components/charts/ViewerGrowthChart';
import ConversionFunnel from '@/components/charts/ConversionFunnel';

type AnalyticsResponse = Awaited<ReturnType<typeof import('@/lib/data/loadAnalytics').loadAnalytics>>;

export default function GrowthPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    fetch('/api/analytics-data').then((res) => res.json()).then((payload: AnalyticsResponse) => setData(payload));
  }, []);

  if (!data) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Growth</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <ViewerGrowthChart data={data.growthData} />
        <ConversionFunnel data={data.conversionFunnel} />
      </div>
    </div>
  );
}
