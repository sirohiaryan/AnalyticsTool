export type Series = {
  id: string;
  title: string;
  startYear: number;
  endYear?: number;
  genres: string[];
  platform?: string;
  totalSeasons?: number;
  poster?: string;
};

export type Season = {
  id: number;
  series_id: number;
  season_number: number;
  release_year: number;
};

export type Episode = {
  id: number;
  series_id?: number;
  season_number?: number;
  episode_number?: number;
  title: string;
  runtime_minutes?: number;
  genre?: string;
  // legacy compatibility fields
  durationMinutes: number;
  retention?: number[];
  completionRate?: number;
  avgListenTime?: number;
  revenue?: number;
  genre_legacy?: string;
};

export type ViewerMetric = {
  series_id: number;
  episode_id: number;
  year: number;
  viewers: number;
  completion_rate: number;
  avg_watch_time: number;
  revenue_estimate: number;
  churn_rate: number;
};


export type Insight = {
  id: string;
  text: string;
  severity: 'info' | 'warning' | 'critical';
};

export type ViewerEvent = {
  user_id: string;
  timestamp: string;
  series_id?: number;
  episode_id: number;
  event_type: 'start' | 'pause' | 'resume' | 'dropoff' | 'complete';
  watch_position: number;
};

export type DateRange = '7d' | '30d' | '90d' | 'custom';

export type FeatureFlags = {
  cohortAnalysis: boolean;
  abTestingInsights: boolean;
  revenueForecasting: boolean;
};

export type AccentColor = 'purple' | 'blue' | 'emerald';
export type ThemeMode = 'dark' | 'light';

export type AnalyticsSummary = {
  totalViewers: number;
  avgCompletion: number;
  avgWatchTime: number;
  revenueEstimate: number;
};

export type RetentionPoint = { minute: number; pctRemaining: number };
export type DropOff = { minute: number; dropPercent: number };
export type GenrePerformance = { genre: string; avgRetention: number };
