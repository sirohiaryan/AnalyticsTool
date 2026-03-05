import { computeGenrePerformance } from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';

const provider = createDataProvider('mock');

export default async function AnalyticsPage() {
  const episodes = await provider.getEpisodes();
  const byGenre = computeGenrePerformance(episodes);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-purple-200">Analytics Deep Dive</h2>
      <div className="rounded-xl border border-slate-800 bg-surface p-4">
        <p className="mb-3 text-slate-300">Genre Performance</p>
        <ul className="space-y-2 text-sm text-slate-300">
          {byGenre.map((row) => (
            <li key={row.genre} className="flex justify-between rounded-lg bg-slate-900/70 p-3">
              <span>{row.genre}</span>
              <span>{row.avgRetention}% avg retention</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
