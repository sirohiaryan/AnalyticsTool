'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { createDataProvider } from '@/lib/dataProvider';
import { Series, ViewerMetric } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

export default function SeriesPage() {
  const provider = useMemo(() => createDataProvider(), []);
  const [series, setSeries] = useState<Series[]>([]);
  const [metrics, setMetrics] = useState<ViewerMetric[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([provider.getSeries(), provider.getViewerMetrics()]).then(([s, m]) => {
      setSeries(s);
      setMetrics(m);
    });
  }, [provider]);

  const filtered = useMemo(() => series.filter((s) => s.title.toLowerCase().includes(query.toLowerCase())), [series, query]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Series</h2>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search series..." className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => {
          const viewers = metrics.filter((m) => m.series_id === s.id).reduce((sum, m) => sum + m.viewers, 0);
          return (
            <Link key={s.id} href={`/series/${s.id}`} className="card p-4">
              <Image src={s.poster} alt={s.title} width={400} height={160} className="mb-3 h-40 w-full rounded-lg object-cover" />
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.genre}</p>
              <p className="mt-2 text-sm">Viewers: {formatNumber(viewers)}</p>
              <p className="text-sm">Seasons: {s.total_seasons}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
