import { bestPerformingEpisode } from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';

const provider = createDataProvider('mock');

export default async function GrowthPage() {
  const episodes = await provider.getEpisodes();
  const best = bestPerformingEpisode(episodes, 'completionRate');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-purple-200">Growth</h2>
      <div className="rounded-xl border border-slate-800 bg-surface p-4 text-slate-300">
        <p>Best completion momentum: Episode {best.id} ({best.score}%).</p>
        <p className="mt-2 text-sm text-slate-400">
          Next action: prioritize promotion for top converters and A/B test intro hooks on low-retention episodes.
        </p>
      </div>
    </div>
  );
}
