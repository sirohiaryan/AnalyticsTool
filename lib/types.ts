export type Episode = {
  id: number;
  title: string;
  durationMinutes: number;
  genre: string;
  retention: number[];
  completionRate: number;
  avgListenTime: number;
  revenue: number;
};

export type ListenerEvent = {
  id: string;
  episodeId: number;
  userId: string | null;
  eventType: 'play' | 'pause' | 'seek' | 'stop';
  timestamp: string;
  positionSec: number;
};

export type Insight = {
  id: string;
  text: string;
  severity: 'info' | 'warning' | 'critical';
};

export type AnalyticsSummary = {
  totalListeners: number;
  avgCompletion: number;
  avgListenTime: number;
  totalRevenue: number;
  bestEpisodeId: number;
};

export type GenrePerformance = {
  genre: string;
  avgRetention: number;
};

export type RetentionPoint = {
  minute: number;
  pctRemaining: number;
};

export type DropOff = {
  minute: number;
  dropPercent: number;
};

export type DateRange = '7d' | '30d' | '90d' | 'custom';

export type DailyGrowthPoint = {
  date: string;
  listeners: number;
};

export type CohortRetentionRow = {
  cohort: string;
  week1: number;
  week2: number;
  week3: number;
};

export type EpisodeTrend = {
  episodeId: number;
  wowGrowthPct: number;
  retentionDelta: number;
};

export type GenreAggregate = {
  genre: string;
  avgCompletion: number;
  totalListeners: number;
};

export type FeatureFlags = {
  cohortAnalysis: boolean;
  abTestingInsights: boolean;
  revenueForecasting: boolean;
};

export type AccentColor = 'purple' | 'blue' | 'emerald';

export type ThemeMode = 'dark' | 'light';
