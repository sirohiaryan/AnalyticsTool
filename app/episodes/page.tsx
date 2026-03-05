import { createDataProvider } from '@/lib/dataProvider';
import { formatCurrency } from '@/lib/utils';

const provider = createDataProvider('mock');

export default async function EpisodesPage() {
  const episodes = await provider.getEpisodes();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-purple-200">Episodes</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {episodes.map((episode) => (
          <div key={episode.id} className="rounded-xl border border-slate-800 bg-surface p-4">
            <h3 className="font-medium">{episode.title}</h3>
            <p className="text-sm text-slate-400">{episode.genre}</p>
            <p className="mt-2 text-sm text-slate-300">Duration: {episode.durationMinutes} min</p>
            <p className="text-sm text-slate-300">Completion: {episode.completionRate}%</p>
            <p className="text-sm text-slate-300">Revenue: {formatCurrency(episode.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
