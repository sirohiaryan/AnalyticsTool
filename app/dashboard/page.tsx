'use client';

import { useEffect, useMemo, useState } from 'react';
import KPI from '@/components/KPI';
import { createDataProvider } from '@/lib/dataProvider';
import { summaryByYear } from '@/lib/analytics/engine';
import { ViewerMetric } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

const years = Array.from({ length: 12 }).map((_, i) => 2013 + i);

export default function DashboardPage() {
  const provider = useMemo(() => createDataProvider(), []);
  const [metrics, setMetrics] = useState<ViewerMetric[]>([]);
  const [year, setYear] = useState(2024);

  useEffect(() => {
    provider.getViewerMetrics().then(setMetrics);
  }, [provider]);

  const summary = useMemo(() => summaryByYear(metrics, year), [metrics, year]);

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Netflix Series Analytics (2013–2024)</h2>
          <p className="text-slate-400">Viewer engagement, retention, and revenue diagnostics.</p>
        </div>
        <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total Viewers" value={formatNumber(summary.totalViewers)} />
        <KPI label="Avg Completion" value={`${summary.avgCompletion}%`} />
        <KPI label="Avg Watch Time" value={`${summary.avgWatchTime} min`} />
        <KPI label="Revenue Estimate" value={formatCurrency(summary.revenueEstimate)} />
      </section>
    </div>
  );
}
