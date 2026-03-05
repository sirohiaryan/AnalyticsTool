'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SelectDropdown from '@/components/controls/SelectDropdown';
import SkeletonCard from '@/components/SkeletonCard';
import { useSettings } from '@/components/providers/SettingsProvider';
import {
  cohortColor,
  filterEventsByDateRange,
  getEngagementMetrics,
  getRetentionSpikeMinutes,
  sortGenreData,
} from '@/lib/analytics';
import { calculateRetentionCurve } from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';
import { CohortRetentionRow, DailyGrowthPoint, Episode, GenreAggregate, ListenerEvent } from '@/lib/types';

export default function AnalyticsPage() {
  const { providerMode, dateRange, customRange, featureFlags } = useSettings();
  const provider = useMemo(() => createDataProvider(providerMode), [providerMode]);

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [events, setEvents] = useState<ListenerEvent[]>([]);
  const [growth, setGrowth] = useState<DailyGrowthPoint[]>([]);
  const [genres, setGenres] = useState<GenreAggregate[]>([]);
  const [cohorts, setCohorts] = useState<CohortRetentionRow[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      provider.getEpisodes(),
      provider.getListenerEvents(),
      provider.getListenerGrowth(),
      provider.getGenreAggregates(),
      provider.getCohortRetention(),
    ])
      .then(([episodeData, eventData, growthData, genreData, cohortData]) => {
        setEpisodes(episodeData);
        setEvents(eventData);
        setGrowth(growthData);
        setGenres(genreData);
        setCohorts(cohortData);
        setSelectedEpisode(episodeData[0]?.id ?? 1);
      })
      .finally(() => setLoading(false));
  }, [provider]);

  const activeEpisode = episodes.find((episode) => episode.id === selectedEpisode) ?? episodes[0];
  const spikes = activeEpisode ? getRetentionSpikeMinutes(activeEpisode) : [];
  const sortedGenres = useMemo(() => sortGenreData(genres, sort), [genres, sort]);
  const filteredEvents = useMemo(
    () => filterEventsByDateRange(events, growth, dateRange, customRange),
    [events, growth, dateRange, customRange],
  );
  const metrics = useMemo(() => getEngagementMetrics(episodes, filteredEvents), [episodes, filteredEvents]);

  if (loading) return <SkeletonCard />;
  if (!episodes.length) return <div className="card p-4">No analytics data found.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>
        Analytics Deep Dive
      </h2>
      <p className="text-sm text-slate-400">Provider: {providerMode} · Range: {dateRange}</p>

      <section className="card p-4">
        <div className="mb-3 max-w-sm">
          <SelectDropdown
            label="Episode Retention"
            value={String(selectedEpisode)}
            onChange={(value) => setSelectedEpisode(Number(value))}
            options={episodes.map((episode) => ({ label: episode.title, value: String(episode.id) }))}
          />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calculateRetentionCurve(activeEpisode)}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="minute" />
              <YAxis />
              <Tooltip />
              {spikes.map((minute) => (
                <ReferenceLine key={minute} x={minute} stroke="#ef4444" strokeDasharray="5 5" />
              ))}
              <Line dataKey="pctRemaining" stroke="rgb(var(--accent-rgb))" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {featureFlags.cohortAnalysis && (
        <section className="card overflow-auto p-4">
          <p className="mb-3 text-sm">Cohort Retention</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left">Cohort</th>
                <th>Week 1</th>
                <th>Week 2</th>
                <th>Week 3</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((row) => (
                <tr key={row.cohort} className="border-t border-slate-800">
                  <td className="py-2">{row.cohort}</td>
                  {[row.week1, row.week2, row.week3].map((value, index) => (
                    <td key={`${row.cohort}-${index}`} className="text-center">
                      <span className="rounded px-2 py-1" style={{ backgroundColor: cohortColor(value) }}>
                        {value}%
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card h-80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">Genre Performance</p>
            <button className="text-xs underline" onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}>
              Sort: {sort}
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedGenres}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="genre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgCompletion" fill="rgb(var(--accent-rgb))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Avg Listen Time', value: `${metrics.avgListenTime} min` },
            { label: 'Completion Rate', value: `${metrics.completionRate}%` },
            { label: 'Replays %', value: `${metrics.replayPct}%` },
            { label: 'Drop-off at 3 min', value: `${metrics.dropAt3}%` },
            { label: 'Returning Listener %', value: `${metrics.returningListenerPct}%` },
          ].map((metric) => (
            <div key={metric.label} className="card p-3">
              <p className="text-xs text-slate-400">{metric.label}</p>
              <p className="text-xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
