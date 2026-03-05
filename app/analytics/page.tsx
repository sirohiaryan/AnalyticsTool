'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import RetentionChart from '@/components/RetentionChart';
import EpisodeCompletionComparison from '@/components/charts/EpisodeCompletionComparison';
import ViewerGrowthChart from '@/components/charts/ViewerGrowthChart';
import ConversionFunnel from '@/components/charts/ConversionFunnel';
import SeriesPerformanceTable from '@/components/charts/SeriesPerformanceTable';
import { forecastNextSeason, forecastPlatformGrowth30d } from '@/lib/forecast/model';

type AnalyticsResponse = Awaited<ReturnType<typeof import('@/lib/data/loadAnalytics').loadAnalytics>>;

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [seriesId, setSeriesId] = useState<string>('1');
  const [episodeId, setEpisodeId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/analytics-data').then((res) => res.json()).then((payload: AnalyticsResponse) => {
      setData(payload);
      const firstSeries = payload.seriesList[0]?.id ?? '1';
      setSeriesId(firstSeries);
      setEpisodeId(payload.episodesBySeries[firstSeries]?.[0]?.id ?? null);
    });
  }, []);

  const episodes = useMemo(() => (data?.episodesBySeries[seriesId] ?? []), [data, seriesId]);
  const completion = useMemo(() => (data?.completionRates[seriesId] ?? []), [data, seriesId]);
  const retentionData = useMemo(() => (episodeId && data ? data.retentionCurves[episodeId] ?? [] : []), [data, episodeId]);
  const growthData = useMemo(() => data?.growthData ?? [], [data]);
  const funnelData = useMemo(() => data?.conversionFunnel ?? [], [data]);
  const seriesPerformance = useMemo(() => data?.seriesPerformance ?? [], [data]);

  const forecastData = useMemo(() => {
    if (!data) return { nextSeason: [], platform30: [] as number[] };
    const nextSeason = data.seriesList.map((s) => ({
      series: s.title,
      viewers: forecastNextSeason(data.viewerMetrics, Number(s.id)),
    }));
    const platform30 = forecastPlatformGrowth30d(data.viewerMetrics);
    return { nextSeason, platform30 };
  }, [data]);

  const platformProjectionSeries = useMemo(
    () => forecastData.platform30.map((viewers, idx) => ({ day: idx + 1, viewers })),
    [forecastData.platform30],
  );

  if (!data) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Analytics</h2>
        <div className="flex gap-2">
          <select
            value={seriesId}
            onChange={(e) => {
              const next = e.target.value;
              setSeriesId(next);
              setEpisodeId(data.episodesBySeries[next]?.[0]?.id ?? null);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2"
          >
            {data.seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <select
            value={episodeId ?? ''}
            onChange={(e) => setEpisodeId(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>{`S${ep.season_number ?? 1}E${ep.episode_number ?? 1}`}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <RetentionChart data={retentionData} />
        <EpisodeCompletionComparison data={completion} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ViewerGrowthChart data={growthData} />
        <ConversionFunnel data={funnelData} />
      </section>

      <SeriesPerformanceTable data={seriesPerformance} />

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Forecast Insights</h3>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="card p-4 text-sm">
            <p className="mb-2 font-medium">Next Season Viewership Forecast</p>
            <ul className="space-y-1">
              {forecastData.nextSeason.map((row) => (
                <li key={row.series} className="flex justify-between"><span>{row.series}</span><span>{row.viewers.toLocaleString()}</span></li>
              ))}
            </ul>
          </div>

          <div className="card h-80 p-4">
            <p className="mb-2 text-sm font-medium">Platform Growth Projection (30 days)</p>
            {platformProjectionSeries.length === 0 ? (
              <p className="text-sm text-slate-400">No analytics data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platformProjectionSeries}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="viewers" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
