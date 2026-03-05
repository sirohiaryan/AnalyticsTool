import { createDataProvider } from '@/lib/dataProvider';
import { popularityRanking, summaryByYear } from '@/lib/analytics/engine';

export default async function AnalyticsPage() {
  const provider = createDataProvider();
  const [series, metrics] = await Promise.all([provider.getSeries(), provider.getViewerMetrics()]);
  const year = 2024;
  const ranking = popularityRanking(metrics, year);
  const summary = summaryByYear(metrics, year);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Analytics</h2>
      <div className="card p-4 text-sm">
        <p>Series popularity ranking (score = viewers × completion):</p>
        <ol className="mt-2 list-decimal pl-5">
          {ranking.map((row) => {
            const item = series.find((s) => s.id === row.seriesId);
            return <li key={row.seriesId}>{item?.title}: {Math.round(row.score).toLocaleString()}</li>;
          })}
        </ol>
      </div>
      <div className="card p-4 text-sm">
        <p>2024 completion comparison & performance baseline</p>
        <p>Total viewers: {summary.totalViewers.toLocaleString()}</p>
        <p>Avg completion: {summary.avgCompletion}%</p>
      </div>
    </div>
  );
}
