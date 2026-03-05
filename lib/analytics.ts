import {
  CohortRetentionRow,
  DailyGrowthPoint,
  DateRange,
  Episode,
  EpisodeTrend,
  FeatureFlags,
  ListenerEvent,
} from '@/lib/types';
import { calculateAvgCompletion, calculateAvgListenTime, findLargestDropOff } from '@/lib/analyticsEngine';

const computeRangeStart = (
  series: DailyGrowthPoint[],
  dateRange: DateRange,
  customRange?: { start: string; end: string },
): Date | null => {
  if (!series.length) return null;
  if (dateRange === 'custom' && customRange?.start) return new Date(customRange.start);
  const end = new Date(series[series.length - 1].date);
  const start = new Date(end);
  if (dateRange === '7d') start.setDate(end.getDate() - 6);
  if (dateRange === '30d') start.setDate(end.getDate() - 29);
  if (dateRange === '90d') start.setDate(end.getDate() - 89);
  return start;
};

export const filterSeriesByDateRange = (
  series: DailyGrowthPoint[],
  dateRange: DateRange,
  customRange?: { start: string; end: string },
): DailyGrowthPoint[] => {
  if (!series.length) return [];
  if (dateRange === 'custom' && customRange?.start && customRange.end) {
    const customStart = new Date(customRange.start);
    const customEnd = new Date(customRange.end);
    return series.filter((point) => {
      const date = new Date(point.date);
      return date >= customStart && date <= customEnd;
    });
  }

  const start = computeRangeStart(series, dateRange, customRange);
  if (!start) return series;
  return series.filter((point) => new Date(point.date) >= start);
};

export const filterEventsByDateRange = (
  events: ListenerEvent[],
  growthSeries: DailyGrowthPoint[],
  dateRange: DateRange,
  customRange?: { start: string; end: string },
): ListenerEvent[] => {
  if (!events.length) return [];
  const start = computeRangeStart(growthSeries, dateRange, customRange);
  if (!start) return events;
  const end = dateRange === 'custom' && customRange?.end ? new Date(customRange.end) : undefined;
  return events.filter((event) => {
    const timestamp = new Date(event.timestamp);
    return timestamp >= start && (!end || timestamp <= end);
  });
};

export const getFunnelMetrics = (episodes: Episode[]) => {
  if (!episodes.length) {
    return [
      { step: 'Started Episode', pct: 100, dropFromPrevious: 0 },
      { step: '25% listened', pct: 0, dropFromPrevious: 100 },
      { step: '50% listened', pct: 0, dropFromPrevious: 0 },
      { step: 'Completed', pct: 0, dropFromPrevious: 0 },
    ];
  }
  const avgCompletion = calculateAvgCompletion(episodes);
  const at50 = Math.min(100, avgCompletion + 22);
  const at25 = Math.min(100, at50 + 18);
  const points = [100, at25, at50, avgCompletion].map((value) => Number(value.toFixed(1)));
  return [
    { step: 'Started Episode', pct: points[0], dropFromPrevious: 0 },
    { step: '25% listened', pct: points[1], dropFromPrevious: Number((points[0] - points[1]).toFixed(1)) },
    { step: '50% listened', pct: points[2], dropFromPrevious: Number((points[1] - points[2]).toFixed(1)) },
    { step: 'Completed', pct: points[3], dropFromPrevious: Number((points[2] - points[3]).toFixed(1)) },
  ];
};

export const buildMomentumTable = (episodes: Episode[], trends: EpisodeTrend[]) => {
  return episodes.map((episode) => {
    const trend = trends.find((item) => item.episodeId === episode.id);
    const wow = trend?.wowGrowthPct ?? 0;
    const delta = trend?.retentionDelta ?? 0;
    const recommendation =
      wow > 3
        ? 'Scale paid acquisition on this episode.'
        : delta < 0
          ? 'Improve first 5 minutes and add stronger recap.'
          : 'Maintain cadence and cross-promote from top episodes.';
    return {
      episode: episode.title,
      completionRate: episode.completionRate,
      wowGrowthPct: wow,
      retentionDelta: delta,
      recommendation,
    };
  });
};

export const forecastNext30Days = (series: DailyGrowthPoint[]): DailyGrowthPoint[] => {
  if (series.length < 2) return [];
  const recent = series.slice(-14);
  const slope = (recent[recent.length - 1].listeners - recent[0].listeners) / Math.max(1, recent.length - 1);
  const lastDate = new Date(series[series.length - 1].date);
  const lastValue = series[series.length - 1].listeners;
  return Array.from({ length: 30 }).map((_, idx) => {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + idx + 1);
    return {
      date: date.toISOString().slice(0, 10),
      listeners: Math.round(lastValue + slope * (idx + 1)),
    };
  });
};

export const getEngagementMetrics = (episodes: Episode[], events: ListenerEvent[]) => {
  const avgListenTime = calculateAvgListenTime(episodes);
  const completionRate = calculateAvgCompletion(episodes);
  const replayEvents = events.filter((event) => event.eventType === 'seek').length;
  const replayPct = events.length ? Number(((replayEvents / events.length) * 100).toFixed(1)) : 0;

  const dropAt3 = episodes.length
    ? Number(
        (
          episodes.reduce((acc, episode) => {
            const start = episode.retention[0] ?? 100;
            const minute3 = episode.retention[Math.min(3, episode.retention.length - 1)] ?? 0;
            return acc + (start - minute3);
          }, 0) / episodes.length
        ).toFixed(1),
      )
    : 0;

  const uniqueUsers = new Set(events.map((event) => event.userId).filter(Boolean));
  const returningUsers = new Set(
    events
      .filter((event) => event.eventType === 'play')
      .map((event) => event.userId)
      .filter((id): id is string => Boolean(id)),
  );

  return {
    avgListenTime,
    completionRate,
    replayPct,
    dropAt3,
    returningListenerPct: uniqueUsers.size ? Number(((returningUsers.size / uniqueUsers.size) * 100).toFixed(1)) : 0,
  };
};

export const getRetentionSpikeMinutes = (episode: Episode): number[] => {
  const largest = findLargestDropOff(episode);
  return [largest.minute];
};

export const sortGenreData = <T extends { avgCompletion: number }>(
  data: T[],
  direction: 'asc' | 'desc',
): T[] => [...data].sort((a, b) => (direction === 'asc' ? a.avgCompletion - b.avgCompletion : b.avgCompletion - a.avgCompletion));

export const cohortColor = (value: number): string => {
  const opacity = Math.min(0.9, Math.max(0.2, value / 100));
  return `rgba(var(--accent-rgb), ${opacity})`;
};

export const isFeatureEnabled = (flags: FeatureFlags, feature: keyof FeatureFlags): boolean => flags[feature];

export const normalizeCohorts = (rows: CohortRetentionRow[]) => rows;
