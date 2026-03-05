/**
 * Supabase migration steps:
 * 1) Implement SupabaseProvider.getEpisodes() using `supabase.from('episodes').select('*')`.
 * 2) Ensure retention arrays are materialized in SQL (or compute via event aggregation in analytics layer).
 * 3) Switch createDataProvider('supabase') and set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Example SQL (Postgres/Supabase):
 * create table episodes (
 *   id bigint primary key generated always as identity,
 *   title text not null,
 *   duration_minutes int not null,
 *   genre text not null,
 *   retention int[] not null,
 *   completion_rate numeric not null,
 *   avg_listen_time numeric not null,
 *   revenue numeric not null
 * );
 * create table listener_events (
 *   id uuid primary key,
 *   episode_id bigint not null references episodes(id),
 *   user_id text,
 *   event_type text not null check (event_type in ('play','pause','seek','stop')),
 *   timestamp timestamptz not null,
 *   position_sec int not null
 * );
 */
import { getAllEpisodes, getListenerEvents } from '@/lib/mockDataSource';
import { Episode, ListenerEvent } from '@/lib/types';

export interface DataProvider {
  getEpisodes(): Promise<Episode[]>;
  getListenerEvents(): Promise<ListenerEvent[]>;
}

class MockDataProvider implements DataProvider {
  getEpisodes(): Promise<Episode[]> {
    return getAllEpisodes();
  }

  getListenerEvents(): Promise<ListenerEvent[]> {
    return getListenerEvents();
  }
}

const providerSingletons: Partial<Record<'mock' | 'supabase' | 'rest', DataProvider>> = {};

export const createDataProvider = (mode: 'mock' | 'supabase' | 'rest' = 'mock'): DataProvider => {
  if (!providerSingletons[mode]) {
    // Stub modes fallback to mock until concrete implementations are added.
    providerSingletons[mode] = new MockDataProvider();
  }
  return providerSingletons[mode] as DataProvider;
};
