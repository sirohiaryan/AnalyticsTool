import {
  AudienceBreakdown,
  CohortRetentionRow,
  DailyGrowthPoint,
  Episode,
  EpisodeRecord,
  EpisodeTrend,
  GenreAggregate,
  ListenerEvent,
  ListenerProfile,
  ListeningEventRow,
  SeriesLeaderboardRow,
  SeriesRecord,
} from '@/lib/types';

const seriesTable: SeriesRecord[] = [
  { id: 1, title: 'Breaking Bad', genre: 'Crime, Drama, Thriller', releaseYear: 2008 },
  { id: 2, title: 'Stranger Things', genre: 'Drama, Fantasy, Horror', releaseYear: 2016 },
  { id: 3, title: 'Dark', genre: 'Crime, Drama, Mystery', releaseYear: 2017 },
  { id: 4, title: 'Money Heist', genre: 'Crime, Drama, Thriller', releaseYear: 2017 },
  { id: 5, title: 'Black Mirror', genre: 'Drama, Mystery, Sci-Fi', releaseYear: 2011 },
];

const episodesTable: EpisodeRecord[] = [
  { id: 101, seriesId: 1, season: 1, episodeNumber: 1, title: 'Pilot', runtimeMinutes: 58, imdbRating: 9.0 },
  { id: 102, seriesId: 1, season: 1, episodeNumber: 6, title: 'Crazy Handful of Nothin\'', runtimeMinutes: 47, imdbRating: 9.3 },
  { id: 201, seriesId: 2, season: 1, episodeNumber: 1, title: 'The Vanishing of Will Byers', runtimeMinutes: 49, imdbRating: 8.5 },
  { id: 202, seriesId: 2, season: 1, episodeNumber: 8, title: 'The Upside Down', runtimeMinutes: 54, imdbRating: 9.0 },
  { id: 301, seriesId: 3, season: 1, episodeNumber: 1, title: 'Secrets', runtimeMinutes: 52, imdbRating: 8.7 },
  { id: 302, seriesId: 3, season: 1, episodeNumber: 10, title: 'Alpha and Omega', runtimeMinutes: 57, imdbRating: 9.1 },
  { id: 401, seriesId: 4, season: 1, episodeNumber: 1, title: 'Do as Planned', runtimeMinutes: 47, imdbRating: 8.4 },
  { id: 402, seriesId: 4, season: 2, episodeNumber: 6, title: 'Aikido', runtimeMinutes: 51, imdbRating: 8.8 },
  { id: 501, seriesId: 5, season: 3, episodeNumber: 1, title: 'Nosedive', runtimeMinutes: 63, imdbRating: 8.3 },
  { id: 502, seriesId: 5, season: 3, episodeNumber: 4, title: 'San Junipero', runtimeMinutes: 61, imdbRating: 8.5 },
];

const countries = ['India', 'US', 'Brazil', 'Spain', 'Germany'];
const devices: ListenerProfile['device'][] = ['mobile', 'web', 'tv'];
const platforms = ['Android', 'iOS', 'Web', 'TV App'];

const createRetentionCurve = (runtimeMinutes: number): number[] => {
  const anchors = new Map<number, number>([
    [0, 100],
    [2, 90],
    [5, 75],
    [10, 60],
    [15, 45],
    [20, 30],
  ]);
  const curve: number[] = [];
  let current = 100;
  for (let minute = 0; minute < runtimeMinutes; minute += 1) {
    if (anchors.has(minute)) current = anchors.get(minute) as number;
    else current = Math.max(8, current - (minute > 20 ? 1 : 2));
    curve.push(current);
  }
  return curve;
};

const episodes: Episode[] = episodesTable.map((row, index) => {
  const series = seriesTable.find((item) => item.id === row.seriesId)!;
  const retention = createRetentionCurve(row.runtimeMinutes);
  const completionRate = retention[retention.length - 1];
  const avgListenTime = Number((row.runtimeMinutes * (completionRate / 100 + 0.34)).toFixed(1));
  const listenersForRevenue = 2200 + index * 770;
  return {
    id: row.id,
    title: `${series.title} S${row.season}E${row.episodeNumber}: ${row.title}`,
    durationMinutes: row.runtimeMinutes,
    genre: series.genre,
    retention,
    completionRate,
    avgListenTime,
    revenue: Math.round(listenersForRevenue * 1.9),
    seriesId: row.seriesId,
    seriesTitle: series.title,
    seasonNumber: row.season,
    episodeNumber: row.episodeNumber,
    imdbRating: row.imdbRating,
    releaseYear: series.releaseYear,
  };
});

const listeners: ListenerProfile[] = Array.from({ length: 9000 }).map((_, idx) => ({
  id: idx + 1,
  country: countries[idx % countries.length],
  device: devices[idx % devices.length],
  signupDate: new Date(Date.now() - (idx % 180) * 86400000).toISOString().slice(0, 10),
}));

const listeningEventsTable: ListeningEventRow[] = episodes.flatMap((episode, epIndex) => {
  const listenerCount = 2000 + epIndex * 800;
  return Array.from({ length: listenerCount }).flatMap((_, idx) => {
    const listener = listeners[(idx * 7 + epIndex * 13) % listeners.length];
    const watchUntilMinute = Math.max(1, Math.floor((episode.durationMinutes * (episode.retention[idx % episode.retention.length] ?? 35)) / 100));
    return Array.from({ length: watchUntilMinute }).map((__, minute) => ({
      id: `le-${episode.id}-${listener.id}-${minute}`,
      listenerId: listener.id,
      episodeId: episode.id,
      minute,
      timestamp: new Date(Date.now() - (minute + idx) * 60000).toISOString(),
      device: listener.device,
      country: listener.country,
    }));
  });
});

const listenerEvents: ListenerEvent[] = listeningEventsTable.map((row) => ({
  id: row.id,
  episodeId: row.episodeId,
  userId: `listener-${row.listenerId}`,
  eventType: row.minute === 0 ? 'play' : row.minute % 9 === 0 ? 'seek' : 'pause',
  timestamp: row.timestamp,
  positionSec: row.minute * 60,
}));

const growthSeries: DailyGrowthPoint[] = Array.from({ length: 120 }).map((_, idx) => ({
  date: new Date(Date.now() - (119 - idx) * 86400000).toISOString().slice(0, 10),
  listeners: Math.round(18000 + idx * 130 + Math.sin(idx / 4) * 900),
}));

const cohortRetention: CohortRetentionRow[] = [
  { cohort: '2026-W01', week1: 100, week2: 68, week3: 52 },
  { cohort: '2026-W02', week1: 100, week2: 66, week3: 50 },
  { cohort: '2026-W03', week1: 100, week2: 70, week3: 54 },
  { cohort: '2026-W04', week1: 100, week2: 69, week3: 53 },
];

const episodeTrends: EpisodeTrend[] = episodes.map((episode, idx) => ({
  episodeId: episode.id,
  wowGrowthPct: Number((1.5 + (idx % 4) * 1.2).toFixed(1)),
  retentionDelta: Number(((idx % 2 ? -1 : 1) * (0.6 + (idx % 3) * 0.4)).toFixed(1)),
}));

const genreAggregates: GenreAggregate[] = Object.values(
  episodes.reduce<Record<string, GenreAggregate>>((acc, episode) => {
    if (!acc[episode.genre]) acc[episode.genre] = { genre: episode.genre, avgCompletion: 0, totalListeners: 0 };
    acc[episode.genre].avgCompletion += episode.completionRate;
    acc[episode.genre].totalListeners += Math.round(episode.revenue / 1.9);
    return acc;
  }, {}),
).map((row) => ({
  ...row,
  avgCompletion: Number((row.avgCompletion / episodes.filter((episode) => episode.genre === row.genre).length).toFixed(1)),
}));

const audienceBreakdown: AudienceBreakdown = {
  country: listeningEventsTable.reduce<Record<string, number>>((acc, row) => {
    acc[row.country] = (acc[row.country] ?? 0) + 1;
    return acc;
  }, {}),
  device: listeningEventsTable.reduce<Record<string, number>>((acc, row) => {
    acc[row.device] = (acc[row.device] ?? 0) + 1;
    return acc;
  }, {}),
  platform: listeningEventsTable.reduce<Record<string, number>>((acc, row, idx) => {
    const platform = platforms[idx % platforms.length];
    acc[platform] = (acc[platform] ?? 0) + 1;
    return acc;
  }, {}),
};

const seriesLeaderboard: SeriesLeaderboardRow[] = seriesTable.map((series) => {
  const rows = episodes.filter((ep) => ep.seriesId === series.id);
  const listenersCount = rows.reduce((sum, row) => sum + Math.round(row.revenue / 1.9), 0);
  return {
    seriesTitle: series.title,
    completionRate: Number((rows.reduce((s, row) => s + row.completionRate, 0) / rows.length).toFixed(1)),
    totalListeners: listenersCount,
  };
});

export const getSeriesTable = async (): Promise<SeriesRecord[]> => seriesTable;
export const getEpisodesTable = async (): Promise<EpisodeRecord[]> => episodesTable;
export const getListenersTable = async (): Promise<ListenerProfile[]> => listeners;
export const getListeningEventsTable = async (): Promise<ListeningEventRow[]> => listeningEventsTable;

export const getAllEpisodes = async (): Promise<Episode[]> => episodes;
export const getListenerEvents = async (): Promise<ListenerEvent[]> => listenerEvents;
export const getListenerGrowthSeries = async (): Promise<DailyGrowthPoint[]> => growthSeries;
export const getCohortRetention = async (): Promise<CohortRetentionRow[]> => cohortRetention;
export const getEpisodeTrends = async (): Promise<EpisodeTrend[]> => episodeTrends;
export const getGenreAggregates = async (): Promise<GenreAggregate[]> => genreAggregates;
export const getAudienceBreakdown = async (): Promise<AudienceBreakdown> => audienceBreakdown;
export const getSeriesLeaderboard = async (): Promise<SeriesLeaderboardRow[]> => seriesLeaderboard;
