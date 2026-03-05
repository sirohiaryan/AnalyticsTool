import fs from 'node:fs';
import path from 'node:path';

const series = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'series.json'), 'utf8')) as Array<{ id: number; title: string }>;
const episodes = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'episodes.json'), 'utf8')) as Array<{ id: number; series_id: number; season_number: number; runtime_minutes: number; episode_number: number }>; 

const ranges: Record<string, [number, number]> = {
  'Game of Thrones': [12_000_000, 25_000_000],
  'Stranger Things': [8_000_000, 20_000_000],
  'Breaking Bad': [4_000_000, 15_000_000],
  'Money Heist': [6_000_000, 18_000_000],
  'Black Mirror': [3_000_000, 10_000_000],
};

const randLogNormal = (mean: number, sigma = 0.35) => {
  const u = Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.exp(Math.log(mean) + sigma * z);
};

const metrics = episodes.flatMap((ep) => {
  const s = series.find((x) => x.id === ep.series_id)!;
  const [min, max] = ranges[s.title];
  return Array.from({ length: 12 }).map((_, y) => {
    const year = 2013 + y;
    const base = min + ((max - min) * y) / 11;
    const seasonFactor = 1 + ep.season_number * 0.08;
    const viewers = Math.round(randLogNormal(base) * seasonFactor);
    const completion = Math.max(35, 88 * Math.exp(-ep.episode_number / 18));
    const avgWatch = Number((ep.runtime_minutes * (completion / 100)).toFixed(2));
    return {
      series_id: ep.series_id,
      episode_id: ep.id,
      year,
      viewers,
      completion_rate: Number(completion.toFixed(2)),
      avg_watch_time: avgWatch,
      revenue_estimate: Math.round(viewers * 0.2),
      churn_rate: Number((22 - completion / 4).toFixed(2)),
    };
  });
});

fs.writeFileSync(path.join(process.cwd(), 'data', 'viewer_metrics.json'), JSON.stringify(metrics, null, 2));
console.log(`Generated ${metrics.length} rows to /data/viewer_metrics.json`);
