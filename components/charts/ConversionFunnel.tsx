'use client';

import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

export default function ConversionFunnel({ data }: { data: Array<{ stage: string; value: number }> }) {
  if (!data || data.length === 0) return <div className="card p-4 text-sm text-slate-400">No analytics data available</div>;

  return (
    <div className="h-80 rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">Conversion Funnel</p>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Funnel dataKey="value" data={data} isAnimationActive>
            <LabelList position="right" fill="#e2e8f0" stroke="none" dataKey="stage" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
