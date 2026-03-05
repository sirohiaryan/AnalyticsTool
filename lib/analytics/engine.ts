import { AnalyticsSummary, Episode, ViewerEvent, ViewerMetric } from '@/lib/types';

export const summaryByYear = (metrics: ViewerMetric[], year: number): AnalyticsSummary => {
  const rows = metrics.filter((m) => m.year === year);
  const totalViewers = rows.reduce((s, r) => s + r.viewers, 0);
  return {
    totalViewers,
    avgCompletion: rows.length ? Number((rows.reduce((s, r) => s + r.completion_rate, 0) / rows.length).toFixed(2)) : 0,
    avgWatchTime: rows.length ? Number((rows.reduce((s, r) => s + r.avg_watch_time, 0) / rows.length).toFixed(2)) : 0,
    revenueEstimate: rows.reduce((s, r) => s + r.revenue_estimate, 0),
  };
};

export const retentionFromEvents = (events: ViewerEvent[], episode: Episode): Array<{ minute: number; retention: number }> => {
  const starts = events.filter((e) => e.episode_id === episode.id && e.event_type === 'start');
  const total = starts.length || 1;
  const rows = [] as Array<{ minute: number; retention: number }>;
  const runtime = episode.runtime_minutes ?? episode.durationMinutes ?? 0;
  for (let minute = 0; minute <= runtime; minute += 1) {
    const remaining = events.filter((e) => e.episode_id === episode.id && e.watch_position >= minute).length;
    rows.push({ minute, retention: Number(((remaining / total) * 100).toFixed(2)) });
  }
  return rows;
};

export const detectDropPoints = (curve: Array<{ minute: number; retention: number }>): number[] => {
  const drops: number[] = [];
  for (let i = 1; i < curve.length; i += 1) {
    if (curve[i - 1].retention - curve[i].retention > 10) drops.push(curve[i].minute);
  }
  return drops;
};

export const popularityRanking = (metrics: ViewerMetric[], year: number) => {
  const bySeries = metrics.filter((m) => m.year === year).reduce<Record<number, number>>((acc, m) => {
    acc[m.series_id] = (acc[m.series_id] ?? 0) + m.viewers * (m.completion_rate / 100);
    return acc;
  }, {});
  return Object.entries(bySeries).map(([seriesId, score]) => ({ seriesId: Number(seriesId), score })).sort((a, b) => b.score - a.score);
};
