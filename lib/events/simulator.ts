import { ViewerEvent } from '@/lib/types';

export const completionFunnel = (events: ViewerEvent[]) => {
  const started = events.filter((e) => e.event_type === 'start').length;
  const completed = events.filter((e) => e.event_type === 'complete').length;
  const dropoff = events.filter((e) => e.event_type === 'dropoff').length;
  return {
    started,
    watched25: Math.round(started * 0.78),
    watched50: Math.round(started * 0.56),
    completed,
    dropoff,
  };
};
