import { datasetProvider } from '@/lib/data/datasetProvider';
import { Episode, Season, Series, ViewerEvent, ViewerMetric } from '@/lib/types';

export interface DataProvider {
  getSeries(): Promise<Series[]>;
  getSeasons(): Promise<Season[]>;
  getEpisodes(): Promise<Episode[]>;
  getViewerMetrics(): Promise<ViewerMetric[]>;
  getViewerEvents(): Promise<ViewerEvent[]>;
}

class DatasetProviderAdapter implements DataProvider {
  getSeries() { return datasetProvider.getSeries(); }
  getSeasons() { return datasetProvider.getSeasons(); }
  getEpisodes() { return datasetProvider.getEpisodes(); }
  getViewerMetrics() { return datasetProvider.getViewerMetrics(); }
  getViewerEvents() { return datasetProvider.getViewerEvents(); }
}

let instance: DataProvider | null = null;

export const createDataProvider = (): DataProvider => {
  if (!instance) instance = new DatasetProviderAdapter();
  return instance;
};
