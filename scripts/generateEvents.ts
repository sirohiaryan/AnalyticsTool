import fs from 'node:fs';
import path from 'node:path';

const input = path.join(process.cwd(), 'data', 'ingested_series.json');
const output = path.join(process.cwd(), 'data', 'generated_events.json');

const episodes = JSON.parse(fs.readFileSync(input, 'utf8')) as Array<{
  id: number;
  runtime_minutes: number;
}>;

const retentionTargets = [
  { minute: 0, pct: 100 },
  { minute: 2, pct: 90 },
  { minute: 5, pct: 75 },
  { minute: 10, pct: 60 },
  { minute: 15, pct: 45 },
  { minute: 20, pct: 30 },
];

const events = episodes.flatMap((episode, idx) => {
  const listenerCount = 2000 + (idx % 8) * 1000;
  return Array.from({ length: listenerCount }).flatMap((_, lIdx) => {
    const basePct = retentionTargets[Math.min(retentionTargets.length - 1, lIdx % retentionTargets.length)].pct;
    const stopMinute = Math.max(1, Math.floor((episode.runtime_minutes * basePct) / 100));
    return Array.from({ length: stopMinute }).map((__, minute) => ({
      id: `evt-${episode.id}-${lIdx}-${minute}`,
      listener_id: lIdx + 1,
      episode_id: episode.id,
      minute,
      timestamp: new Date(Date.now() - minute * 60000).toISOString(),
      device: ['mobile', 'web', 'tv'][lIdx % 3],
      country: ['India', 'US', 'Spain', 'Brazil', 'Germany'][lIdx % 5],
    }));
  });
});

fs.writeFileSync(output, JSON.stringify(events, null, 2));
console.log(`Generated ${events.length} listening events at ${output}`);
