import {
  CohortRetentionRow,
  DailyGrowthPoint,
  Episode,
  EpisodeTrend,
  GenreAggregate,
  ListenerEvent,
} from '@/lib/types';

const episodeSeed: Array<{ title: string; genre: string; durationMinutes: number; listeners: number }> = [
  { title: 'The Last Signal - Ep 1', genre: 'Thriller', durationMinutes: 22, listeners: 245000 },
  { title: 'The Last Signal - Ep 2', genre: 'Thriller', durationMinutes: 20, listeners: 210000 },
  { title: 'Moon Bazaar - Ep 1', genre: 'Sci-Fi', durationMinutes: 18, listeners: 164000 },
  { title: 'Moon Bazaar - Ep 2', genre: 'Sci-Fi', durationMinutes: 21, listeners: 152000 },
  { title: 'Broken Oath - Ep 5', genre: 'Fantasy', durationMinutes: 27, listeners: 98000 },
  { title: 'Broken Oath - Ep 6', genre: 'Fantasy', durationMinutes: 29, listeners: 86000 },
  { title: 'Campus Cipher - Ep 3', genre: 'Mystery', durationMinutes: 14, listeners: 121000 },
  { title: 'Campus Cipher - Ep 4', genre: 'Mystery', durationMinutes: 16, listeners: 109000 },
  { title: 'City of Raga - Ep 1', genre: 'Drama', durationMinutes: 11, listeners: 73000 },
  { title: 'City of Raga - Ep 2', genre: 'Drama', durationMinutes: 13, listeners: 67000 },
];

const createRetention = (duration: number, seed: number): number[] => {
  const points: number[] = [100];
  for (let m = 1; m < duration; m += 1) {
    const prev = points[m - 1];
    const normalized = m / duration;
    const baseDecay = Math.max(1, Math.round(2 + normalized * 2 + ((seed + m) % 2)));
    const earlyDrop = m >= 2 && m <= 4 ? 4 + (seed % 4) : 0;
    const midDrop = m === Math.floor(duration * 0.45) || m === Math.floor(duration * 0.62) ? 7 + (seed % 6) : 0;
    points.push(Math.max(0, prev - baseDecay - earlyDrop - midDrop));
  }
  return points;
};

const episodes: Episode[] = episodeSeed.map((item, index) => {
  const retention = createRetention(item.durationMinutes, index + 2);
  const completionRate = retention[retention.length - 1];
  const avgListenTime = Number(((item.durationMinutes * (completionRate / 100 + 0.5))).toFixed(2));
  const revenue = Math.round(item.listeners * 0.19 + item.durationMinutes * 430);
  return {
    id: index + 1,
    title: item.title,
    durationMinutes: item.durationMinutes,
    genre: item.genre,
    retention,
    completionRate,
    avgListenTime,
    revenue,
  };
});

const startDate = new Date();
startDate.setDate(startDate.getDate() - 119);

const growthSeries: DailyGrowthPoint[] = Array.from({ length: 120 }).map((_, idx) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + idx);
  const trend = 70000 + idx * 880;
  const seasonality = Math.sin(idx / 5.5) * 3900;
  const pulse = idx % 21 === 0 ? 4200 : 0;
  return {
    date: date.toISOString().slice(0, 10),
    listeners: Math.max(12000, Math.round(trend + seasonality + pulse)),
  };
});

const cohortRetention: CohortRetentionRow[] = [
  { cohort: '2026-W01', week1: 100, week2: 66, week3: 49 },
  { cohort: '2026-W02', week1: 100, week2: 63, week3: 45 },
  { cohort: '2026-W03', week1: 100, week2: 68, week3: 52 },
  { cohort: '2026-W04', week1: 100, week2: 71, week3: 55 },
  { cohort: '2026-W05', week1: 100, week2: 69, week3: 53 },
];

const episodeTrends: EpisodeTrend[] = episodes.map((episode, idx) => ({
  episodeId: episode.id,
  wowGrowthPct: Number((2 + (idx % 5) * 1.4 - (idx % 3) * 0.7).toFixed(1)),
  retentionDelta: Number((1.5 - (idx % 4) * 0.9).toFixed(1)),
}));

const genreAggregates: GenreAggregate[] = Object.values(
  episodes.reduce<Record<string, GenreAggregate>>((acc, episode) => {
    if (!acc[episode.genre]) {
      acc[episode.genre] = { genre: episode.genre, avgCompletion: 0, totalListeners: 0 };
    }
    acc[episode.genre].avgCompletion += episode.completionRate;
    acc[episode.genre].totalListeners += Math.round(episode.revenue / 0.19);
    return acc;
  }, {}),
).map((item) => {
  const genreEpisodes = episodes.filter((episode) => episode.genre === item.genre).length;
  return {
    ...item,
    avgCompletion: Number((item.avgCompletion / genreEpisodes).toFixed(2)),
  };
});

const listenerEvents: ListenerEvent[] = episodes.flatMap((episode) => {
  const syntheticUsers = Math.min(500, Math.max(160, Math.round(episode.revenue / 140)));
  return Array.from({ length: syntheticUsers }).flatMap((_, userIdx) => {
    const userId = `u-${episode.id}-${userIdx}`;
    const stopMinute = Math.max(
      1,
      episode.retention.findIndex((value) => value < (35 + (userIdx % 20))) || episode.durationMinutes - 1,
    );
    const eventBaseTime = Date.now() - (episode.id * 100000 + userIdx * 1000);
    return [
      {
        id: `evt-${episode.id}-${userIdx}-play`,
        episodeId: episode.id,
        userId,
        eventType: 'play' as const,
        timestamp: new Date(eventBaseTime).toISOString(),
        positionSec: 0,
      },
      {
        id: `evt-${episode.id}-${userIdx}-seek`,
        episodeId: episode.id,
        userId,
        eventType: 'seek' as const,
        timestamp: new Date(eventBaseTime + 120000).toISOString(),
        positionSec: Math.min(stopMinute * 60, episode.durationMinutes * 60),
      },
      {
        id: `evt-${episode.id}-${userIdx}-stop`,
        episodeId: episode.id,
        userId,
        eventType: 'stop' as const,
        timestamp: new Date(eventBaseTime + stopMinute * 180000).toISOString(),
        positionSec: Math.min(stopMinute * 60, episode.durationMinutes * 60),
      },
    ];
  });
});

export const getAllEpisodes = async (): Promise<Episode[]> => episodes;
export const getListenerEvents = async (): Promise<ListenerEvent[]> => listenerEvents;
export const getListenerGrowthSeries = async (): Promise<DailyGrowthPoint[]> => growthSeries;
export const getCohortRetention = async (): Promise<CohortRetentionRow[]> => cohortRetention;
export const getEpisodeTrends = async (): Promise<EpisodeTrend[]> => episodeTrends;
export const getGenreAggregates = async (): Promise<GenreAggregate[]> => genreAggregates;
