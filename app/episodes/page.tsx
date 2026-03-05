'use client';

import { useEffect, useMemo, useState } from 'react';
import SkeletonCard from '@/components/SkeletonCard';
import { useSettings } from '@/components/providers/SettingsProvider';
import { createDataProvider } from '@/lib/dataProvider';
import { Episode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function EpisodesPage() {
  const { providerMode, dateRange } = useSettings();
  const provider = useMemo(() => createDataProvider(providerMode), [providerMode]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    provider.getEpisodes().then(setEpisodes);
  }, [provider]);

  if (!episodes.length) return <SkeletonCard />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Episodes</h2>
      <p className="text-sm text-slate-400">Showing performance view for selected range: {dateRange}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {episodes.map((episode) => (
          <div key={episode.id} className="card p-4">
            <h3 className="font-medium">{episode.title}</h3>
            <p className="text-sm text-slate-400">{episode.genre}</p>
            <p className="mt-2 text-sm">Duration: {episode.durationMinutes} min</p>
            <p className="text-sm">Completion: {episode.completionRate}%</p>
            <p className="text-sm">Revenue: {formatCurrency(episode.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
