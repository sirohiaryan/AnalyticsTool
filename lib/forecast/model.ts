import { ViewerMetric } from '@/lib/types';

export const exponentialSmoothing = (values: number[], alpha = 0.35): number => {
  if (!values.length) return 0;
  let s = values[0];
  for (let i = 1; i < values.length; i += 1) s = alpha * values[i] + (1 - alpha) * s;
  return s;
};

export const forecastNextSeason = (metrics: ViewerMetric[], seriesId: number): number => {
  const values = metrics.filter((m) => m.series_id === seriesId).map((m) => m.viewers);
  return Math.round(exponentialSmoothing(values, 0.4));
};

export const forecastPlatformGrowth30d = (metrics: ViewerMetric[]): number[] => {
  const yearly = metrics.reduce<Record<number, number>>((acc, m) => {
    acc[m.year] = (acc[m.year] ?? 0) + m.viewers;
    return acc;
  }, {});
  const series = Object.entries(yearly).sort((a, b) => Number(a[0]) - Number(b[0])).map(([, v]) => v);
  const base = exponentialSmoothing(series, 0.3);
  return Array.from({ length: 30 }).map((_, i) => Math.round(base * (1 + i * 0.004)));
};
