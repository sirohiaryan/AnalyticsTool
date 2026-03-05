import fs from 'node:fs/promises';
import path from 'node:path';
import { createDataProvider } from '@/lib/dataProvider';
import { Episode, Series, ViewerEvent, ViewerMetric } from '@/lib/types';

export type AnalyticsBundle = {
  seriesList: Series[];
  episodesBySeries: Record<number, Episode[]>;
  viewerMetrics: ViewerMetric[];
  yearlyViewerStats: Array<{ year: number; viewers: number }>;
  retentionCurves: Record<number, Array<{ minute: number; retention: number }>>;
  growthData: Array<{ year: number; viewers: number }>;
  completionRates: Record<number, Array<{ episode: string; completion: number }>>;
  conversionFunnel: Array<{ stage: string; value: number }>;
  seriesPerformance: Array<{
    series: string;
    avgCompletion: number;
    viewerGrowth: number;
    retentionDelta: number;
    recommendation: string;
  }>;
};

const readJson = async <T,>(fileName: string): Promise<T | null> => {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
};

const retentionCurveForEpisode = (episode: Episode, metrics: ViewerMetric[]) => {
  const runtime = episode.runtime_minutes ?? episode.durationMinutes ?? 45;
  const metricRows = metrics.filter((m) => m.episode_id === episode.id);
  const avgCompletion = metricRows.length
    ? metricRows.reduce((sum, row) => sum + row.completion_rate, 0) / metricRows.length
    : 60;

  return Array.from({ length: runtime + 1 }).map((_, minute) => {
    const normalized = minute / Math.max(1, runtime);
    const retention = Math.max(0.08, 1 - normalized * (1 - avgCompletion / 100));
    return { minute, retention: Number(retention.toFixed(3)) };
  });
};

export const loadAnalytics = async (): Promise<AnalyticsBundle> => {
  const provider = createDataProvider();

  const [providerSeries, providerEpisodes, providerMetrics, providerEvents] = await Promise.all([
    provider.getSeries(),
    provider.getEpisodes(),
    provider.getViewerMetrics(),
    provider.getViewerEvents(),
  ]);

  const seriesList = (await readJson<Series[]>('series.json')) ?? providerSeries;
  const episodes = (await readJson<Episode[]>('episodes.json')) ?? providerEpisodes;
  const viewerMetrics = (await readJson<ViewerMetric[]>('viewer_metrics.json')) ?? providerMetrics;
  const viewEvents = (await readJson<ViewerEvent[]>('view_events.json')) ?? providerEvents;

  const episodesBySeries = episodes.reduce<Record<number, Episode[]>>((acc, episode) => {
    const seriesId = episode.series_id ?? 0;
    if (!acc[seriesId]) acc[seriesId] = [];
    acc[seriesId].push(episode);
    return acc;
  }, {});

  const yearlyMap = viewerMetrics.reduce<Record<number, number>>((acc, metric) => {
    acc[metric.year] = (acc[metric.year] ?? 0) + metric.viewers;
    return acc;
  }, {});

  const yearlyViewerStats = Object.entries(yearlyMap)
    .map(([year, viewers]) => ({ year: Number(year), viewers }))
    .sort((a, b) => a.year - b.year);

  const retentionCurves = episodes.reduce<Record<number, Array<{ minute: number; retention: number }>>>((acc, episode) => {
    acc[episode.id] = retentionCurveForEpisode(episode, viewerMetrics);
    return acc;
  }, {});

  const completionRates = Object.entries(episodesBySeries).reduce<Record<number, Array<{ episode: string; completion: number }>>>((acc, [seriesId, seriesEpisodes]) => {
    acc[Number(seriesId)] = seriesEpisodes.map((episode) => {
      const rows = viewerMetrics.filter((m) => m.episode_id === episode.id);
      const completion = rows.length ? rows.reduce((sum, row) => sum + row.completion_rate, 0) / rows.length / 100 : 0;
      return {
        episode: `S${episode.season_number ?? 1}E${episode.episode_number ?? 1}`,
        completion: Number(completion.toFixed(3)),
      };
    });
    return acc;
  }, {});

  const starts = viewEvents.filter((e) => e.event_type === 'start').length || 1;
  const stageValue = (threshold: number) => {
    const count = viewEvents.filter((e) => e.watch_position >= threshold).length;
    return Math.round((count / starts) * 100);
  };

  const conversionFunnel = [
    { stage: 'Started Episode', value: 100 },
    { stage: '25% Watched', value: stageValue(12) },
    { stage: '50% Watched', value: stageValue(24) },
    { stage: '75% Watched', value: stageValue(36) },
    { stage: 'Completed', value: Math.round((viewEvents.filter((e) => e.event_type === 'complete').length / starts) * 100) },
  ];

  const seriesPerformance = seriesList.map((series) => {
    const rows = viewerMetrics.filter((m) => m.series_id === series.id);
    const avgCompletion = rows.length ? rows.reduce((sum, row) => sum + row.completion_rate, 0) / rows.length : 0;
    const minYear = Math.min(...rows.map((r) => r.year));
    const maxYear = Math.max(...rows.map((r) => r.year));
    const early = rows.filter((r) => r.year === minYear).reduce((sum, r) => sum + r.viewers, 0);
    const late = rows.filter((r) => r.year === maxYear).reduce((sum, r) => sum + r.viewers, 0);
    const viewerGrowth = early ? ((late - early) / early) * 100 : 0;
    const curve = Object.values(retentionCurves)[0] ?? [];
    const retentionDelta = curve.length > 1 ? (curve[0].retention - curve[Math.min(10, curve.length - 1)].retention) * 100 : 0;
    const recommendation = avgCompletion < 60 ? 'Improve episode pacing and reduce early drop-offs.' : 'Scale promotion and invest in sequel development.';

    return {
      series: series.title,
      avgCompletion: Number(avgCompletion.toFixed(2)),
      viewerGrowth: Number(viewerGrowth.toFixed(2)),
      retentionDelta: Number(retentionDelta.toFixed(2)),
      recommendation,
    };
  });

  return {
    seriesList,
    episodesBySeries,
    viewerMetrics,
    yearlyViewerStats,
    retentionCurves,
    growthData: yearlyViewerStats,
    completionRates,
    conversionFunnel,
    seriesPerformance,
  };
};
