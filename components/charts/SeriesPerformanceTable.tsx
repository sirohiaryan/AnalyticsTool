export default function SeriesPerformanceTable({
  data,
}: {
  data: Array<{ series: string; avgCompletion: number; viewerGrowth: number; retentionDelta: number; recommendation: string }>;
}) {
  if (!data || data.length === 0) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  return (
    <div className="card overflow-auto p-4">
      <p className="mb-3 text-sm text-slate-300">Series Performance Table</p>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400">
          <tr>
            <th>Series</th>
            <th>Avg Completion</th>
            <th>Viewer Growth</th>
            <th>Retention Delta</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.series} className="border-t border-slate-800 align-top">
              <td className="py-2 pr-2">{row.series}</td>
              <td>{row.avgCompletion}%</td>
              <td>{row.viewerGrowth}%</td>
              <td>{row.retentionDelta}%</td>
              <td className="text-xs text-slate-300">{row.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
