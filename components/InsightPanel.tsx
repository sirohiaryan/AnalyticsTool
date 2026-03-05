'use client';

import { useEffect, useState } from 'react';
import { Insight } from '@/lib/types';

type InsightsResponse = {
  insights: Insight[];
};

const severityStyles: Record<Insight['severity'], string> = {
  info: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  warning: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  critical: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
};

export default function InsightPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((data: InsightsResponse) => setInsights(data.insights))
      .catch(() => setInsights([]));
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-surface p-4">
      <p className="mb-3 text-sm text-slate-300">AI Insights</p>
      <div className="space-y-2">
        {insights.map((insight) => (
          <div key={insight.id} className={`rounded-lg border p-3 text-sm ${severityStyles[insight.severity]}`}>
            {insight.text}
          </div>
        ))}
        {!insights.length && <p className="text-sm text-slate-500">No insights available.</p>}
      </div>
    </div>
  );
}
