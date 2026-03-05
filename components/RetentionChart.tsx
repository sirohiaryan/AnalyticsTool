'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DropOff, RetentionPoint } from '@/lib/types';

type RetentionChartProps = {
  data: RetentionPoint[];
  dropOff: DropOff;
};

export default function RetentionChart({ data, dropOff }: RetentionChartProps) {
  return (
    <div className="h-80 rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Audience Retention Curve</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="minute" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <ReferenceLine x={dropOff.minute} stroke="#ef4444" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="pctRemaining" stroke="#8b5cf6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
