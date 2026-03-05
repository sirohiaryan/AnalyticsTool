'use client';

import { useEffect, useMemo, useState } from 'react';
import KPI from '@/components/KPI';
import RetentionChart from '@/components/RetentionChart';
import EpisodeCompletionComparison from '@/components/charts/EpisodeCompletionComparison';
import ViewerGrowthChart from '@/components/charts/ViewerGrowthChart';
import ConversionFunnel from '@/components/charts/ConversionFunnel';
import SeriesPerformanceTable from '@/components/charts/SeriesPerformanceTable';
import { formatCurrency, formatNumber } from '@/lib/utils';

type AnalyticsResponse = Awaited<ReturnType<typeof import('@/lib/data/loadAnalytics').loadAnalytics>>;

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [year, setYear] = useState(2024);
  const [seriesId, setSeriesId] = useState<number>(1);

  useEffect(() => {
    fetch('/api/analytics-data').then((res) => res.json()).then((payload: AnalyticsResponse) => {
      setData(payload);
      setSeriesId(payload.seriesList[0]?.id ?? 1);
    });
  }, []);

  const yearly = useMemo(() => {
    if (!data) return { viewers: 0, completion: 0, watch: 0, revenue: 0 };
    const rows = data.viewerMetrics.filter((m) => m.year === year);
    const viewers = rows.reduce((sum, row) => sum + row.viewers, 0);
    const completion = rows.length ? rows.reduce((sum, row) => sum + row.completion_rate, 0) / rows.length : 0;
    const watch = rows.length ? rows.reduce((sum, row) => sum + row.avg_watch_time, 0) / rows.length : 0;
    const revenue = rows.reduce((sum, row) => sum + row.revenue_estimate, 0);
    return { viewers, completion, watch, revenue };
  }, [data, year]);

  if (!data) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  const firstEpisode = data.episodesBySeries[seriesId]?.[0];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Netflix Series Analytics (2013–2024)</h2>
          <p className="text-slate-400">All charts are dataset-backed and reactive by series/year selection.</p>
        </div>
        <div className="flex gap-2">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 p-2">
            {Array.from({ length: 12 }).map((_, i) => 2013 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={seriesId} onChange={(e) => setSeriesId(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 p-2">
            {data.seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total Viewers" value={formatNumber(yearly.viewers)} />
        <KPI label="Avg Completion" value={`${yearly.completion.toFixed(2)}%`} />
        <KPI label="Avg Watch Time" value={`${yearly.watch.toFixed(2)} min`} />
        <KPI label="Revenue Estimate" value={formatCurrency(yearly.revenue)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <RetentionChart data={firstEpisode ? data.retentionCurves[firstEpisode.id] : []} />
        <EpisodeCompletionComparison data={data.completionRates[seriesId] ?? []} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ViewerGrowthChart data={data.growthData} />
        <ConversionFunnel data={data.conversionFunnel} />
      </section>

      <SeriesPerformanceTable data={data.seriesPerformance} />
    </div>
  );
}
