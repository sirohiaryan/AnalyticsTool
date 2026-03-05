'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SkeletonCard from '@/components/SkeletonCard';
import { useSettings } from '@/components/providers/SettingsProvider';
import {
  buildMomentumTable,
  filterSeriesByDateRange,
  forecastNext30Days,
  getFunnelMetrics,
} from '@/lib/analytics';
import { createDataProvider } from '@/lib/dataProvider';
import { DailyGrowthPoint, Episode, EpisodeTrend } from '@/lib/types';

export default function GrowthPage() {
  const { providerMode, dateRange, customRange, featureFlags } = useSettings();
  const provider = useMemo(() => createDataProvider(providerMode), [providerMode]);

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [growth, setGrowth] = useState<DailyGrowthPoint[]>([]);
  const [trends, setTrends] = useState<EpisodeTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([provider.getEpisodes(), provider.getListenerGrowth(), provider.getEpisodeTrends()])
      .then(([episodeData, growthData, trendData]) => {
        setEpisodes(episodeData);
        setGrowth(growthData);
        setTrends(trendData);
      })
      .finally(() => setLoading(false));
  }, [provider]);

  const filteredGrowth = useMemo(
    () => filterSeriesByDateRange(growth, dateRange, customRange),
    [growth, dateRange, customRange],
  );

  const funnel = useMemo(() => getFunnelMetrics(episodes), [episodes]);
  const momentumRows = useMemo(() => buildMomentumTable(episodes, trends), [episodes, trends]);
  const forecast = useMemo(() => forecastNext30Days(filteredGrowth), [filteredGrowth]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!filteredGrowth.length) {
    return <div className="card p-4 text-sm text-slate-400">No growth points available for selected range.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>
        Growth
      </h2>
      <p className="text-sm text-slate-400">Provider: {providerMode} · Range: {dateRange}</p>

      <section className="card h-80 p-4">
        <p className="mb-3 text-sm">Listener Growth</p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredGrowth}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Line dataKey="listeners" stroke="rgb(var(--accent-rgb))" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <p className="mb-3 text-sm">Conversion Funnel</p>
          <div className="space-y-2">
            {funnel.map((step) => (
              <div key={step.step} className="rounded-lg bg-slate-900/60 p-3 text-sm">
                <div className="flex justify-between">
                  <span>{step.step}</span>
                  <span>{step.pct}%</span>
                </div>
                <p className="text-xs text-slate-400">Drop from previous: {step.dropFromPrevious}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-auto p-4">
          <p className="mb-3 text-sm">Episode Momentum</p>
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th>Episode</th>
                <th>Completion</th>
                <th>WoW</th>
                <th>Retention Δ</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {momentumRows.map((row) => (
                <tr key={row.episode} className="border-t border-slate-800 align-top">
                  <td className="py-2 pr-2">{row.episode}</td>
                  <td>{row.completionRate}%</td>
                  <td>{row.wowGrowthPct}%</td>
                  <td>{row.retentionDelta}%</td>
                  <td className="text-xs text-slate-300">{row.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {featureFlags.revenueForecasting && (
        <section className="card h-80 p-4">
          <p className="mb-3 text-sm">Projected Listener Growth (next 30 days)</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="listeners" stroke="#22c55e" dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}
