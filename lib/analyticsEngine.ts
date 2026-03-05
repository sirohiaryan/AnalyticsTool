import { DropOff, Episode, GenrePerformance, Insight, RetentionPoint } from '@/lib/types';

const listenersFromEpisode = (episode: Episode) => Math.max(0, Math.round((episode.revenue ?? 0) / 0.19));

export const calculateTotalListeners = (episodes: Episode[]): number => episodes.reduce((sum, episode) => sum + listenersFromEpisode(episode), 0);

export const calculateAvgCompletion = (episodes: Episode[]): number => {
  if (!episodes.length) return 0;
  return Number((episodes.reduce((sum, ep) => sum + (ep.completionRate ?? 0), 0) / episodes.length).toFixed(2));
};

export const calculateAvgListenTime = (episodes: Episode[]): number => {
  if (!episodes.length) return 0;
  const totalListeners = calculateTotalListeners(episodes) || 1;
  const weighted = episodes.reduce((sum, ep) => sum + (ep.avgListenTime ?? 0) * listenersFromEpisode(ep), 0);
  return Number((weighted / totalListeners).toFixed(2));
};

export const calculateRetentionCurve = (episode: Episode): RetentionPoint[] => (episode.retention ?? []).map((pctRemaining, idx) => ({ minute: idx, pctRemaining }));

export const findLargestDropOff = (episode: Episode): DropOff => {
  const retention = episode.retention ?? [];
  let maxDrop = 0;
  let minute = 0;
  for (let i = 1; i < retention.length; i += 1) {
    const drop = retention[i - 1] - retention[i];
    if (drop > maxDrop) {
      maxDrop = drop;
      minute = i;
    }
  }
  return { minute, dropPercent: maxDrop };
};

export const bestPerformingEpisode = (
  episodes: Episode[],
  metric: keyof Pick<Episode, 'revenue' | 'completionRate' | 'avgListenTime'> = 'revenue',
): { id: number; score: number } => {
  if (!episodes.length) return { id: -1, score: 0 };
  const best = episodes.reduce((currentBest, episode) => (Number(episode[metric] ?? 0) > Number(currentBest[metric] ?? 0) ? episode : currentBest));
  return { id: best.id, score: Number(best[metric] ?? 0) };
};

export const computeGenrePerformance = (episodes: Episode[]): GenrePerformance[] => {
  const grouped = episodes.reduce<Record<string, number[]>>((acc, episode) => {
    const genre = episode.genre ?? 'Unknown';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(episode.completionRate ?? 0);
    return acc;
  }, {});

  return Object.entries(grouped).map(([genre, values]) => ({
    genre,
    avgRetention: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
  }));
};

export const generateInsights = (episodes: Episode[]): Insight[] => {
  if (!episodes.length) return [];
  const top = bestPerformingEpisode(episodes);
  const avgCompletion = calculateAvgCompletion(episodes);
  const first = episodes[0];
  const drop = findLargestDropOff(first);
  return [
    { id: 'top-episode', text: `Episode ${top.id} is top performer by revenue score ${top.score.toLocaleString()}.`, severity: 'info' },
    { id: 'completion-benchmark', text: `Portfolio average completion is ${avgCompletion}%.`, severity: avgCompletion < 45 ? 'warning' : 'info' },
    { id: `drop-${first.id}`, text: `${first.title} has a sharp drop of ${drop.dropPercent}% at minute ${drop.minute}.`, severity: drop.dropPercent > 10 ? 'critical' : 'warning' },
  ];
};
