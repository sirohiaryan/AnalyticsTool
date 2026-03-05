'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ViewerGrowthChart({ data }: { data: Array<{ year: number; viewers: number }> }) {
  if (!data || data.length === 0) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  return (
    <div className="h-80 rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Viewer Growth</p>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="viewers" stroke="#8b5cf6" fill="#8b5cf633" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
