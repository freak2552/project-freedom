import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { getReportCards } from '@/lib/report-data';

// GET /api/report/months: minimal cards for every finished month, newest first.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const reports = await getReportCards(userId);
    return NextResponse.json({ reports });
  } catch (err) {
    console.error('GET /api/report/months failed', err);
    return NextResponse.json({ error: 'Could not load reports.' }, { status: 500 });
  }
}
