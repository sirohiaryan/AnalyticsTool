import { NextResponse } from 'next/server';
import { createDataProvider } from '@/lib/dataProvider';
import { summaryByYear } from '@/lib/analytics/engine';

export async function GET() {
  const provider = createDataProvider();
  const metrics = await provider.getViewerMetrics();
  const summary = summaryByYear(metrics, 2024);
  const insights = [
    { id: 'i1', text: 'Completion is strongest for premium fantasy and thriller titles.', severity: 'info' as const },
    { id: 'i2', text: 'Drop detected at early minutes for long-runtime episodes.', severity: 'warning' as const },
  ];
  return NextResponse.json({ insights, summary });
}
