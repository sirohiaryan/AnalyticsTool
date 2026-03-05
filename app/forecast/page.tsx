import { createDataProvider } from '@/lib/dataProvider';
import { forecastNextSeason, forecastPlatformGrowth30d } from '@/lib/forecast/model';

export default async function ForecastPage() {
  const provider = createDataProvider();
  const [series, metrics] = await Promise.all([provider.getSeries(), provider.getViewerMetrics()]);
  const platform30 = forecastPlatformGrowth30d(metrics);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Forecast</h2>
      <div className="card p-4 text-sm">
        <p className="mb-2">Next season viewership forecast</p>
        <ul>
          {series.map((s) => <li key={s.id}>{s.title}: {forecastNextSeason(metrics, s.id).toLocaleString()} viewers</li>)}
        </ul>
      </div>
      <div className="card p-4 text-sm">
        <p className="mb-2">30-day platform growth (exponential smoothing)</p>
        <p>{platform30.slice(0, 10).map((v) => v.toLocaleString()).join(' · ')} ...</p>
      </div>
    </div>
  );
}
