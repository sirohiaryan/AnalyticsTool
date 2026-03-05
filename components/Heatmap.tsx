type HeatmapProps = {
  data: Array<{ episode: string; buckets: number[] }>;
};

export default function Heatmap({ data }: HeatmapProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Listener Density Heatmap</p>
      <div className="space-y-2">
        {data.map((row) => (
          <div key={row.episode} className="grid grid-cols-[180px_1fr] items-center gap-3">
            <p className="truncate text-xs text-slate-400">{row.episode}</p>
            <div className="grid grid-cols-5 gap-2">
              {row.buckets.map((bucket, idx) => (
                <div
                  key={`${row.episode}-${idx}`}
                  className="h-8 rounded"
                  style={{ backgroundColor: `rgba(139,92,246,${Math.max(0.15, bucket / 100)})` }}
                  title={`Segment ${idx + 1}: ${bucket}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
