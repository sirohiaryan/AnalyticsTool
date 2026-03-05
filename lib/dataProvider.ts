/**
 * Supabase migration steps:
 * 1) Implement SupabaseProvider.getEpisodes() using `supabase.from('episodes').select('*')`.
 * 2) Ensure retention arrays are materialized in SQL (or compute via event aggregation in analytics layer).
 * 3) Switch createDataProvider('supabase') and set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
import {
  getAllEpisodes,
  getAudienceBreakdown,
  getCohortRetention,
  getEpisodeTrends,
  getGenreAggregates,
  getListenerEvents,
  getListenerGrowthSeries,
  getSeriesLeaderboard,
  getSeriesTable,
} from '@/lib/mockDataSource';
import { DatasetDataProvider } from '@/lib/datasetDataProvider';
import {
  AudienceBreakdown,
  CohortRetentionRow,
  DailyGrowthPoint,
  Episode,
  EpisodeTrend,
  GenreAggregate,
  ListenerEvent,
  SeriesLeaderboardRow,
  SeriesRecord,
} from '@/lib/types';

export interface DataProvider {
  getEpisodes(): Promise<Episode[]>;
  getListenerEvents(): Promise<ListenerEvent[]>;
  getListenerGrowth(): Promise<DailyGrowthPoint[]>;
  getCohortRetention(): Promise<CohortRetentionRow[]>;
  getEpisodeTrends(): Promise<EpisodeTrend[]>;
  getGenreAggregates(): Promise<GenreAggregate[]>;
  getAudienceBreakdown(): Promise<AudienceBreakdown>;
  getSeriesLeaderboard(): Promise<SeriesLeaderboardRow[]>;
  getSeries(): Promise<SeriesRecord[]>;
}

class MockDataProvider implements DataProvider {
  getEpisodes(): Promise<Episode[]> { return getAllEpisodes(); }
  getListenerEvents(): Promise<ListenerEvent[]> { return getListenerEvents(); }
  getListenerGrowth(): Promise<DailyGrowthPoint[]> { return getListenerGrowthSeries(); }
  getCohortRetention(): Promise<CohortRetentionRow[]> { return getCohortRetention(); }
  getEpisodeTrends(): Promise<EpisodeTrend[]> { return getEpisodeTrends(); }
  getGenreAggregates(): Promise<GenreAggregate[]> { return getGenreAggregates(); }
  getAudienceBreakdown(): Promise<AudienceBreakdown> { return getAudienceBreakdown(); }
  getSeriesLeaderboard(): Promise<SeriesLeaderboardRow[]> { return getSeriesLeaderboard(); }
  getSeries(): Promise<SeriesRecord[]> { return getSeriesTable(); }
}

const providerSingletons: Partial<Record<'mock' | 'supabase' | 'rest' | 'dataset', DataProvider>> = {};

export const createDataProvider = (
  mode: 'mock' | 'supabase' | 'rest' | 'dataset' = 'dataset',
): DataProvider => {
  if (!providerSingletons[mode]) {
    if (mode === 'dataset') providerSingletons[mode] = new DatasetDataProvider();
    else providerSingletons[mode] = new MockDataProvider();
  }
  return providerSingletons[mode] as DataProvider;
};
