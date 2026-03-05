import { NextResponse } from 'next/server';
import {
  bestPerformingEpisode,
  calculateAvgCompletion,
  calculateAvgListenTime,
  calculateTotalListeners,
  generateInsights,
} from '@/lib/analyticsEngine';
import { createDataProvider } from '@/lib/dataProvider';
import { AnalyticsSummary } from '@/lib/types';

const provider = createDataProvider('mock');

export async function GET() {
  const [episodes] = await Promise.all([provider.getEpisodes(), provider.getListenerEvents()]);
  const summary: AnalyticsSummary = {
    totalListeners: calculateTotalListeners(episodes),
    avgCompletion: calculateAvgCompletion(episodes),
    avgListenTime: calculateAvgListenTime(episodes),
    totalRevenue: episodes.reduce((sum, ep) => sum + ep.revenue, 0),
    bestEpisodeId: bestPerformingEpisode(episodes).id,
  };

  return NextResponse.json({ insights: generateInsights(episodes), summary });
}
