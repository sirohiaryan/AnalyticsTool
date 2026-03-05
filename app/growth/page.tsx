'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { createDataProvider } from '@/lib/dataProvider';
import { ViewerMetric } from '@/lib/types';

export default function GrowthPage() {
  const provider = useMemo(() => createDataProvider(), []);
  const [metrics, setMetrics] = useState<ViewerMetric[]>([]);

  useEffect(() => {
    provider.getViewerMetrics().then(setMetrics);
  }, [provider]);

  const byYear = useMemo(() => {
    const map = metrics.reduce<Record<number, number>>((acc, m) => {
      acc[m.year] = (acc[m.year] ?? 0) + m.viewers;
      return acc;
    }, {});
    return Object.entries(map).map(([year, viewers]) => ({ year, viewers })).sort((a, b) => Number(a.year) - Number(b.year));
  }, [metrics]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Growth</h2>
      <section className="card h-80 p-4">
        <p className="mb-2 text-sm">Viewer growth by year</p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={byYear}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line dataKey="viewers" stroke="rgb(var(--accent-rgb))" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
