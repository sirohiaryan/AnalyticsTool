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
import { DataProvider } from '@/lib/dataProvider';
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

export class DatasetDataProvider implements DataProvider {
  getEpisodes(): Promise<Episode[]> {
    return getAllEpisodes();
  }

  getListenerEvents(): Promise<ListenerEvent[]> {
    return getListenerEvents();
  }

  getListenerGrowth(): Promise<DailyGrowthPoint[]> {
    return getListenerGrowthSeries();
  }

  getCohortRetention(): Promise<CohortRetentionRow[]> {
    return getCohortRetention();
  }

  getEpisodeTrends(): Promise<EpisodeTrend[]> {
    return getEpisodeTrends();
  }

  getGenreAggregates(): Promise<GenreAggregate[]> {
    return getGenreAggregates();
  }

  getAudienceBreakdown(): Promise<AudienceBreakdown> {
    return getAudienceBreakdown();
  }

  getSeriesLeaderboard(): Promise<SeriesLeaderboardRow[]> {
    return getSeriesLeaderboard();
  }

  getSeries(): Promise<SeriesRecord[]> {
    return getSeriesTable();
  }
}
