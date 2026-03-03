'use client';

import { useEffect, useMemo, useState } from 'react';
import CompletionChart from '@/components/CompletionChart';
import Heatmap from '@/components/Heatmap';
import InsightPanel from '@/components/InsightPanel';
import KPI from '@/components/KPI';
import RetentionChart from '@/components/RetentionChart';
import {
  bestPerformingEpisode,
  calculateAvgCompletion,
  calculateAvgListenTime,
  calculateRetentionCurve,
  calculateTotalListeners,
  findLargestDropOff,
} from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';
import { Episode } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

const provider = createDataProvider('mock');

export default function DashboardPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number>(1);

  useEffect(() => {
    provider.getEpisodes().then((items) => {
      setEpisodes(items);
      if (items[0]) setSelectedEpisodeId(items[0].id);
    });
  }, []);

  const summary = useMemo(() => {
    const best = bestPerformingEpisode(episodes);
    return {
      totalListeners: calculateTotalListeners(episodes),
      avgCompletion: calculateAvgCompletion(episodes),
      avgListenTime: calculateAvgListenTime(episodes),
      totalRevenue: episodes.reduce((sum, ep) => sum + ep.revenue, 0),
      bestEpisodeId: best.id,
    };
  }, [episodes]);

  const selectedEpisode = episodes.find((ep) => ep.id === selectedEpisodeId) ?? episodes[0];

  const heatmapData = useMemo(
    () =>
      episodes.map((episode) => {
        const size = Math.ceil(episode.retention.length / 5);
        const buckets = Array.from({ length: 5 }, (_, idx) => {
          const segment = episode.retention.slice(idx * size, (idx + 1) * size);
          if (!segment.length) return 0;
          return Math.round(segment.reduce((a, b) => a + b, 0) / segment.length);
        });
        return { episode: episode.title, buckets };
      }),
    [episodes],
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-purple-200">Creator Dashboard</h2>
        <p className="text-slate-400">Snapshot of serialized audio performance and engagement trends.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total Listeners" value={formatNumber(summary.totalListeners)} />
        <KPI label="Avg Completion" value={`${summary.avgCompletion}%`} />
        <KPI label="Avg Listen Time" value={`${summary.avgListenTime} min`} />
        <KPI label="Est. Revenue" value={formatCurrency(summary.totalRevenue)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm text-slate-400" htmlFor="episodeSelect">
            Select episode for retention
          </label>
          <select
            id="episodeSelect"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-100"
            value={selectedEpisodeId}
            onChange={(e) => setSelectedEpisodeId(Number(e.target.value))}
          >
            {episodes.map((episode) => (
              <option key={episode.id} value={episode.id}>
                {episode.title}
              </option>
            ))}
          </select>
          {selectedEpisode && (
            <RetentionChart
              data={calculateRetentionCurve(selectedEpisode)}
              dropOff={findLargestDropOff(selectedEpisode)}
            />
          )}
        </div>

        <CompletionChart
          data={episodes.map((episode) => ({ title: `Ep ${episode.id}`, completionRate: episode.completionRate }))}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Heatmap data={heatmapData} />
        <InsightPanel />
      </section>
    </div>
  );
}
