import {
  calculateRetentionCurve,
  findLargestDropOff,
  generateInsights,
} from '@/lib/analyticsEngine';
import { Episode } from '@/lib/types';

const sampleEpisode: Episode = {
  id: 77,
  title: 'Test Episode',
  durationMinutes: 6,
  genre: 'Test',
  retention: [100, 94, 87, 60, 55, 53],
  completionRate: 53,
  avgListenTime: 4.2,
  revenue: 10000,
};

describe('analyticsEngine', () => {
  it('detects largest single-minute drop-off correctly', () => {
    const drop = findLargestDropOff(sampleEpisode);
    expect(drop).toEqual({ minute: 3, dropPercent: 27 });
  });

  it('returns retention points with minute and percentage', () => {
    const curve = calculateRetentionCurve(sampleEpisode);
    expect(curve).toHaveLength(sampleEpisode.durationMinutes);
    expect(curve[0]).toEqual({ minute: 0, pctRemaining: 100 });
    expect(curve[3]).toEqual({ minute: 3, pctRemaining: 60 });
  });

  it('generates deterministic insights', () => {
    const insights = generateInsights([sampleEpisode]);
    expect(insights.length).toBeGreaterThan(1);
    expect(insights[0].id).toBe('top-episode');
    expect(insights.some((i) => i.id === 'drop-77')).toBe(true);
  });
});
