import { Episode, ListenerEvent } from '@/lib/types';

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
    const isEarlyDrop = m >= 2 && m <= 4;
    const isMidDrop = m === Math.floor(duration * 0.45) || m === Math.floor(duration * 0.62);
    const baseDrop = 1 + ((seed + m) % 3);
    const extraDrop = isEarlyDrop ? 4 + (seed % 4) : isMidDrop ? 7 + (seed % 5) : 0;
    points.push(Math.max(0, prev - baseDrop - extraDrop));
  }
  return points;
};

const episodes: Episode[] = episodeSeed.map((item, index) => {
  const retention = createRetention(item.durationMinutes, index + 2);
  const completionRate = retention[retention.length - 1];
  const avgListenTime = Number(((item.durationMinutes * (completionRate / 100 + 0.46))).toFixed(2));
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

const listenerEvents: ListenerEvent[] = episodes.flatMap((episode) => {
  const syntheticUsers = Math.min(500, Math.max(140, Math.round(episode.revenue / 150)));
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
