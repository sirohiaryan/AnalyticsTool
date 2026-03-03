import {
  DropOff,
  Episode,
  GenrePerformance,
  Insight,
  RetentionPoint,
} from '@/lib/types';

export const calculateTotalListeners = (episodes: Episode[]): number =>
  episodes.reduce((sum, episode) => sum + Math.round(episode.revenue / 0.19), 0);

export const calculateAvgCompletion = (episodes: Episode[]): number => {
  if (!episodes.length) return 0;
  return Number((episodes.reduce((sum, ep) => sum + ep.completionRate, 0) / episodes.length).toFixed(2));
};

export const calculateAvgListenTime = (episodes: Episode[]): number => {
  if (!episodes.length) return 0;
  const totalListeners = calculateTotalListeners(episodes);
  const weighted = episodes.reduce((sum, ep) => {
    const listeners = Math.round(ep.revenue / 0.19);
    return sum + ep.avgListenTime * listeners;
  }, 0);
  return Number((weighted / totalListeners).toFixed(2));
};

export const calculateRetentionCurve = (episode: Episode): RetentionPoint[] =>
  episode.retention.map((pctRemaining, idx) => ({ minute: idx, pctRemaining }));

export const findLargestDropOff = (episode: Episode): DropOff => {
  let maxDrop = 0;
  let minute = 0;
  for (let i = 1; i < episode.retention.length; i += 1) {
    const drop = episode.retention[i - 1] - episode.retention[i];
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
  const best = episodes.reduce((currentBest, episode) =>
    episode[metric] > currentBest[metric] ? episode : currentBest,
  );
  return { id: best.id, score: Number(best[metric]) };
};

export const computeGenrePerformance = (episodes: Episode[]): GenrePerformance[] => {
  const grouped = episodes.reduce<Record<string, number[]>>((acc, episode) => {
    if (!acc[episode.genre]) acc[episode.genre] = [];
    acc[episode.genre].push(calculateAvgCompletion([episode]));
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

  const dropInsights = episodes.slice(0, 3).map((episode, idx): Insight => {
    const drop = findLargestDropOff(episode);
    const severity = drop.dropPercent >= 10 ? 'critical' : drop.dropPercent >= 6 ? 'warning' : 'info';
    return {
      id: `drop-${episode.id}`,
      text: `${episode.title} has a sharp drop of ${drop.dropPercent}% at minute ${drop.minute}. Consider moving hook earlier.`,
      severity,
    };
  });

  return [
    {
      id: 'top-episode',
      text: `Episode ${top.id} is the top performer by revenue with a score of ${top.score.toLocaleString()}.`,
      severity: 'info',
    },
    {
      id: 'completion-benchmark',
      text: `Portfolio average completion is ${avgCompletion}%. Episodes below this line need stronger mid-episode cliffhangers.`,
      severity: avgCompletion < 45 ? 'warning' : 'info',
    },
    ...dropInsights,
  ];
};
