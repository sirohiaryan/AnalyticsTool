# Creator Analytics (Next.js 14)

Production-structured analytics app for serialized audio creators (Pocket FM-like) with a swappable data provider abstraction.

## Bootstrap commands

```bash
npx create-next-app@latest analytics-tool --typescript --tailwind --app
cd analytics-tool
npm install recharts lucide-react
npm install -D jest ts-jest @types/jest jest-environment-node
```

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000/dashboard
```

## Replace MockDataProvider with SupabaseProvider

At the top of `lib/dataProvider.ts`, keep this migration checklist in code:
1. Implement `SupabaseProvider.getEpisodes()` using `supabase.from('episodes').select('*')`.
2. Ensure retention arrays are materialized (or compute retention from event aggregation).
3. Switch `createDataProvider('supabase')` and configure `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Example provider sketch

```ts
class SupabaseProvider implements DataProvider {
  async getEpisodes() {
    const { data, error } = await supabase.from('episodes').select('*');
    if (error) throw error;
    return data as Episode[];
  }

  async getListenerEvents() {
    const { data, error } = await supabase.from('listener_events').select('*');
    if (error) throw error;
    return data as ListenerEvent[];
  }
}
```

### SQL schema (Postgres/Supabase)

```sql
create table episodes (
  id bigint primary key generated always as identity,
  title text not null,
  duration_minutes int not null,
  genre text not null,
  retention int[] not null,
  completion_rate numeric not null,
  avg_listen_time numeric not null,
  revenue numeric not null
);

create table listener_events (
  id uuid primary key,
  episode_id bigint not null references episodes(id),
  user_id text,
  event_type text not null check (event_type in ('play','pause','seek','stop')),
  timestamp timestamptz not null,
  position_sec int not null
);
```

## Pipeline to integrate real data

1. **Instrumentation**: Add client/server playback SDK events (`play/pause/seek/stop`) with idempotency keys. Tools: Segment / RudderStack / custom Kafka producer.
2. **Ingestion**: Stream events into Kafka or Kinesis; partition by `episode_id` and event date.
3. **Stream processing**: Use Flink/Spark Structured Streaming to compute rolling retention + session metrics.
4. **Warehouse**: Land clean fact tables in BigQuery/Snowflake/Redshift, maintain raw + curated zones.
5. **dbt models**: Build marts (`fct_listener_events`, `fct_episode_daily`, `dim_episode`) and quality tests.
6. **Serving API**: Replace mock provider with Supabase/Postgres-backed provider and cache results in Redis.

## Resume bullet

Built a modular Next.js 14 creator analytics platform with swappable data providers, deterministic insight generation, and chart-driven retention diagnostics for serialized audio products.
