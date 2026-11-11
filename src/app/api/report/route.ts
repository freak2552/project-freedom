import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { currentMonthKey, isMonthKey } from '@/lib/dates';
import { getMonthlyReport } from '@/lib/report-data';

// GET /api/report?month=2026-10: the full report for one finished month.
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const month = new URL(request.url).searchParams.get('month');
  if (!isMonthKey(month)) return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
  if (month >= currentMonthKey()) {
    return NextResponse.json({ error: 'Reports are only for finished months.' }, { status: 400 });
  }

  try {
    const report = await getMonthlyReport(userId, month);
    return NextResponse.json({ report });
  } catch (err) {
    console.error('GET /api/report failed', err);
    return NextResponse.json({ error: 'Could not load this report.' }, { status: 500 });
  }
}
