import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { currentMonthKey, isMonthKey } from '@/lib/dates';
import { defaultReportName } from '@/lib/report';
import { MonthReport } from '@/models/MonthReport';

const saveSchema = z.object({
  monthKey: z.string().refine(isMonthKey, 'Invalid month'),
  name: z.string().trim().max(60, 'Name is too long.'),
});

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000;
}

// PUT /api/report/name: body { monthKey, name }.
// An empty name removes the custom name, so the month shows its default "Month Year" name.
export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }
  const { monthKey, name } = parsed.data;

  if (monthKey >= currentMonthKey()) {
    return NextResponse.json({ error: 'Reports are only for finished months.' }, { status: 400 });
  }

  try {
    await connectDB();
    if (name === '') {
      await MonthReport.deleteOne({ userId, monthKey });
    } else {
      const filter = { userId, monthKey };
      const update = { $set: { name } };
      try {
        await MonthReport.findOneAndUpdate(filter, update, { upsert: true, new: true });
      } catch (err) {
        // Two quick saves can race to create the same month. Retry as a plain update.
        if (!isDuplicateKeyError(err)) throw err;
        await MonthReport.findOneAndUpdate(filter, update, { new: true });
      }
    }

    return NextResponse.json({
      monthKey,
      name: name || defaultReportName(monthKey),
      isCustomName: name !== '',
    });
  } catch (err) {
    console.error('PUT /api/report/name failed', err);
    return NextResponse.json({ error: 'Could not save the report name.' }, { status: 500 });
  }
}
