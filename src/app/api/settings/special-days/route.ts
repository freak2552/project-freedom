import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { isDateKey } from '@/lib/dates';
import { StudySettings } from '@/models/StudySettings';

const createSchema = z.object({
  date: z.string().refine(isDateKey, 'Invalid date'),
  hours: z.number().min(0).max(24),
});

// Adds or replaces the special-day target for one date.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { date, hours } = parsed.data;

  await connectDB();
  await StudySettings.updateOne(
    { userId },
    { $set: { [`specialDays.${date}`]: hours } },
    { upsert: true },
  );

  return NextResponse.json({ date, hours }, { status: 201 });
}
