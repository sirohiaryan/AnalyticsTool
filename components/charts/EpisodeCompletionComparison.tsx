'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function EpisodeCompletionComparison({
  data,
}: {
  data: Array<{ episode: string; completion: number }>;
}) {
  if (!data || data.length === 0) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  return (
    <div className="h-80 rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Episode Completion Comparison</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="episode" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={[0, 1]} />
          <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
          <Bar dataKey="completion" fill="#a78bfa" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
