import { generateInsights } from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';

const provider = createDataProvider('mock');

export default async function InsightsPage() {
  const episodes = await provider.getEpisodes();
  const insights = generateInsights(episodes);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-purple-200">Insights</h2>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-xl border border-slate-800 bg-surface p-4 text-slate-200">
            <p className="text-xs uppercase text-slate-500">{insight.severity}</p>
            <p>{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
