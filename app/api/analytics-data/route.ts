import { NextResponse } from 'next/server';
import { loadAnalytics } from '@/lib/data/loadAnalytics';

export async function GET() {
  const data = await loadAnalytics();
  return NextResponse.json(data);
}
