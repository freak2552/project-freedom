import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { isDateKey } from '@/lib/dates';
import { StudySettings } from '@/models/StudySettings';

type Params = { params: Promise<{ date: string }> };

const updateSchema = z.object({ hours: z.number().min(0).max(24) });

// Edit the target hours of one special day.
export async function PATCH(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date } = await params;
  if (!isDateKey(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Hours must be between 0 and 24' }, { status: 400 });
  }

  await connectDB();
  const existing = await StudySettings.exists({ userId, [`specialDays.${date}`]: { $exists: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await StudySettings.updateOne({ userId }, { $set: { [`specialDays.${date}`]: parsed.data.hours } });
  return NextResponse.json({ date, hours: parsed.data.hours });
}

// Remove a special-day target; that date falls back to the normal daily target.
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date } = await params;
  if (!isDateKey(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  await connectDB();
  await StudySettings.updateOne({ userId }, { $unset: { [`specialDays.${date}`]: '' } });
  return NextResponse.json({ ok: true });
}
