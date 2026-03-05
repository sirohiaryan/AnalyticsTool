'use client';

import { useEffect, useMemo, useState } from 'react';
import SkeletonCard from '@/components/SkeletonCard';
import { useSettings } from '@/components/providers/SettingsProvider';
import { generateInsights } from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';
import { Insight } from '@/lib/types';

export default function InsightsPage() {
  const { providerMode, dateRange, featureFlags } = useSettings();
  const provider = useMemo(() => createDataProvider(providerMode), [providerMode]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    provider.getEpisodes().then((episodes) => {
      const baseInsights = generateInsights(episodes);
      const additional = featureFlags.abTestingInsights
        ? [{ id: 'ab', severity: 'info' as const, text: 'A/B testing insight enabled: intro variant B improves minute-3 retention.' }]
        : [];
      setInsights([...baseInsights, ...additional]);
    });
  }, [provider, featureFlags.abTestingInsights]);

  if (!insights.length) return <SkeletonCard />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Insights</h2>
      <p className="text-sm text-slate-400">Active date range: {dateRange}</p>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="card p-4">
            <p className="text-xs uppercase text-slate-500">{insight.severity}</p>
            <p>{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
