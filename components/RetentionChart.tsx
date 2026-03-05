'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type RetentionChartProps = {
  data: Array<{ minute: number; retention: number }>;
};

export default function RetentionChart({ data }: RetentionChartProps) {
  if (!data || data.length === 0) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  const dropMinute = data.find((row, idx) => idx > 0 && data[idx - 1].retention - row.retention > 0.1)?.minute;

  return (
    <div className="h-80 rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Retention Curve</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="minute" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={[0, 1]} />
          <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
          {dropMinute !== undefined && <ReferenceLine x={dropMinute} stroke="#ef4444" strokeDasharray="4 4" />}
          <Line type="monotone" dataKey="retention" stroke="#8b5cf6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
