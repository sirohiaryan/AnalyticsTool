import { Episode, Season, Series, ViewerEvent, ViewerMetric } from '@/lib/types';

const series: Series[] = [
  { id: 1, title: 'Breaking Bad', platform: 'Netflix', start_year: 2008, end_year: 2013, genre: 'Crime, Drama', total_seasons: 5, poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400' },
  { id: 2, title: 'Game of Thrones', platform: 'HBO/Netflix (licensed)', start_year: 2011, end_year: 2019, genre: 'Fantasy, Drama', total_seasons: 8, poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400' },
  { id: 3, title: 'Stranger Things', platform: 'Netflix', start_year: 2016, end_year: 2025, genre: 'Sci-Fi, Horror', total_seasons: 5, poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400' },
  { id: 4, title: 'Black Mirror', platform: 'Netflix', start_year: 2011, end_year: 2024, genre: 'Sci-Fi, Anthology', total_seasons: 6, poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400' },
  { id: 5, title: 'Money Heist', platform: 'Netflix', start_year: 2017, end_year: 2021, genre: 'Crime, Thriller', total_seasons: 5, poster: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400' },
];

const seasons: Season[] = series.flatMap((s) => Array.from({ length: Math.min(3, s.total_seasons) }).map((_, i) => ({
  id: s.id * 10 + i + 1,
  series_id: s.id,
  season_number: i + 1,
  release_year: s.start_year + i,
})));

const episodes: Episode[] = seasons.flatMap((season) =>
  Array.from({ length: 6 }).map((_, i) => ({
    id: season.id * 100 + i + 1,
    series_id: season.series_id,
    season_number: season.season_number,
    episode_number: i + 1,
    title: `Episode ${i + 1}`,
    runtime_minutes: 42 + ((i + season.season_number) % 4) * 6,
    durationMinutes: 42 + ((i + season.season_number) % 4) * 6,
  })),
);

const popularityBase: Record<number, [number, number]> = {
  1: [4_000_000, 15_000_000],
  2: [12_000_000, 25_000_000],
  3: [8_000_000, 20_000_000],
  4: [3_000_000, 10_000_000],
  5: [6_000_000, 18_000_000],
};

const viewerMetrics: ViewerMetric[] = episodes.flatMap((ep) => {
  const sid = ep.series_id ?? 1;
  const [min, max] = popularityBase[sid];
  return Array.from({ length: 12 }).map((_, i) => {
    const year = 2013 + i;
    const seasonNumber = ep.season_number ?? 1;
    const episodeNumber = ep.episode_number ?? 1;
    const runtime = ep.runtime_minutes ?? ep.durationMinutes ?? 45;
    const seasonGrowth = 1 + seasonNumber * 0.07;
    const viewers = Math.round((min + ((max - min) * (i / 11))) * seasonGrowth * (0.75 + Math.random() * 0.35));
    const completion_rate = Math.max(35, Math.min(92, 82 - episodeNumber * 3 - seasonNumber + Math.random() * 8));
    const avg_watch_time = Number((runtime * (completion_rate / 100)).toFixed(1));
    const churn_rate = Number((Math.max(3, 18 - completion_rate / 6 + Math.random() * 3)).toFixed(2));
    return {
      series_id: sid,
      episode_id: ep.id,
      year,
      viewers,
      completion_rate: Number(completion_rate.toFixed(2)),
      avg_watch_time,
      revenue_estimate: Math.round(viewers * 0.17),
      churn_rate,
    };
  });
});

const viewerEvents: ViewerEvent[] = [];
for (let userIdx = 1; userIdx <= 50000; userIdx += 1) {
  const ep = episodes[userIdx % episodes.length];
  const sid = ep.series_id ?? 1;
  const runtime = ep.runtime_minutes ?? ep.durationMinutes ?? 45;
  const base = new Date(Date.now() - userIdx * 5000);
  const progress = Math.min(runtime, Math.round(runtime * (0.3 + (userIdx % 70) / 100)));
  viewerEvents.push({ user_id: `u-${userIdx}`, timestamp: base.toISOString(), series_id: sid, episode_id: ep.id, event_type: 'start', watch_position: 0 });
  if (progress > 8) viewerEvents.push({ user_id: `u-${userIdx}`, timestamp: new Date(base.getTime() + 120000).toISOString(), series_id: sid, episode_id: ep.id, event_type: 'pause', watch_position: 8 });
  if (progress > 10) viewerEvents.push({ user_id: `u-${userIdx}`, timestamp: new Date(base.getTime() + 180000).toISOString(), series_id: sid, episode_id: ep.id, event_type: 'resume', watch_position: 10 });
  viewerEvents.push({ user_id: `u-${userIdx}`, timestamp: new Date(base.getTime() + progress * 60000).toISOString(), series_id: sid, episode_id: ep.id, event_type: progress > runtime * 0.85 ? 'complete' : 'dropoff', watch_position: progress });
}

export const datasetProvider = {
  getSeries: async () => series,
  getSeasons: async () => seasons,
  getEpisodes: async () => episodes,
  getViewerMetrics: async () => viewerMetrics,
  getViewerEvents: async () => viewerEvents,
};
