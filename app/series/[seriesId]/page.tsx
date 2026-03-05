import { createDataProvider } from '@/lib/dataProvider';
import { retentionFromEvents, detectDropPoints } from '@/lib/analytics/engine';

export default async function SeriesDetailPage({ params }: { params: { seriesId: string } }) {
  const provider = createDataProvider();
  const seriesId = params.seriesId;
  const numericSeriesId = Number(seriesId);
  const [series, episodes, events, metrics] = await Promise.all([
    provider.getSeries(),
    provider.getEpisodes(),
    provider.getViewerEvents(),
    provider.getViewerMetrics(),
  ]);

  const current = series.find((s) => s.id === seriesId);
  const list = episodes.filter((e) => e.series_id === numericSeriesId);
  const selected = list[0];
  const curve = selected ? retentionFromEvents(events, selected) : [];
  const drops = detectDropPoints(curve);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>{current?.title}</h2>
      <p className="text-sm text-slate-400">Season selector and episode analytics overview.</p>
      <div className="card p-4">
        <h3 className="mb-2 font-medium">Episodes</h3>
        <ul className="grid gap-2 md:grid-cols-2">
          {list.map((ep) => {
            const epMetric = metrics.find((m) => m.episode_id === ep.id && m.year === 2024);
            return <li key={ep.id} className="rounded-lg border border-slate-700 p-2 text-sm">S{ep.season_number}E{ep.episode_number} {ep.title} · Completion {epMetric?.completion_rate ?? 0}%</li>;
          })}
        </ul>
      </div>
      <div className="card p-4 text-sm">
        <p>Retention curve points: {curve.slice(0, 10).map((c) => `${c.minute}:${c.retention}%`).join(' | ')} ...</p>
        {drops.length > 0 && <p className="mt-2 text-rose-300">Drop detected at minute {drops[0]}.</p>}
      </div>
    </div>
  );
}
