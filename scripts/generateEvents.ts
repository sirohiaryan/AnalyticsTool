import fs from 'node:fs';
import path from 'node:path';

const episodes = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'episodes.json'), 'utf8')) as Array<{ id: number; series_id: number; runtime_minutes: number }>;

const events: Array<{ user_id: string; timestamp: string; series_id: number; episode_id: number; event_type: string; watch_position: number }> = [];
for (let i = 1; i <= 50000; i += 1) {
  const ep = episodes[i % episodes.length];
  const start = new Date(Date.now() - i * 10000);
  const watch = Math.max(1, Math.floor(ep.runtime_minutes * (0.25 + (i % 70) / 100)));
  events.push({ user_id: `u-${i}`, timestamp: start.toISOString(), series_id: ep.series_id, episode_id: ep.id, event_type: 'start', watch_position: 0 });
  if (watch > 5) events.push({ user_id: `u-${i}`, timestamp: new Date(start.getTime() + 60000 * 5).toISOString(), series_id: ep.series_id, episode_id: ep.id, event_type: 'pause', watch_position: 5 });
  if (watch > 8) events.push({ user_id: `u-${i}`, timestamp: new Date(start.getTime() + 60000 * 8).toISOString(), series_id: ep.series_id, episode_id: ep.id, event_type: 'resume', watch_position: 8 });
  events.push({ user_id: `u-${i}`, timestamp: new Date(start.getTime() + 60000 * watch).toISOString(), series_id: ep.series_id, episode_id: ep.id, event_type: watch > ep.runtime_minutes * 0.85 ? 'complete' : 'dropoff', watch_position: watch });
}

fs.writeFileSync(path.join(process.cwd(), 'data', 'view_events.json'), JSON.stringify(events, null, 2));
console.log(`Generated ${events.length} events to /data/view_events.json`);
