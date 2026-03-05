'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type CompletionChartProps = {
  data: Array<{ title: string; completionRate: number }>;
};

export default function CompletionChart({ data }: CompletionChartProps) {
  return (
    <div className="h-80 rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Episode Completion Comparison</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="title" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-15} height={55} />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="completionRate" fill="#a78bfa" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
