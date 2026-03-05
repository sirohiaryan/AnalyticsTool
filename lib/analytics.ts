import { DateRange, ViewerEvent, ViewerMetric } from '@/lib/types';

export const filterMetricsByYear = (metrics: ViewerMetric[], year: number) => metrics.filter((m) => m.year === year);

export const filterEventsByDateRange = (
  events: ViewerEvent[],
  dateRange: DateRange,
  customRange?: { start: string; end: string },
): ViewerEvent[] => {
  const now = new Date();
  let start = new Date(now);
  if (dateRange === '7d') start.setDate(now.getDate() - 7);
  if (dateRange === '30d') start.setDate(now.getDate() - 30);
  if (dateRange === '90d') start.setDate(now.getDate() - 90);
  if (dateRange === 'custom' && customRange?.start && customRange?.end) {
    const cStart = new Date(customRange.start);
    const cEnd = new Date(customRange.end);
    return events.filter((e) => {
      const t = new Date(e.timestamp);
      return t >= cStart && t <= cEnd;
    });
  }
  return events.filter((e) => new Date(e.timestamp) >= start);
};

export const completionFunnelFromEvents = (events: ViewerEvent[]) => {
  const started = events.filter((e) => e.event_type === 'start').length;
  const completed = events.filter((e) => e.event_type === 'complete').length;
  return {
    started,
    listened25: Math.round(started * 0.8),
    listened50: Math.round(started * 0.58),
    completed,
  };
};
