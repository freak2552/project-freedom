import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { isDateKey } from '@/lib/dates';
import { Habit } from '@/models/Habit';
import { HABIT_COLORS, HabitLog } from '@/models/HabitLog';

const saveSchema = z.object({
  habitId: z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid habit'),
  dateKey: z.string().refine(isDateKey, 'Invalid date'),
  color: z.enum(HABIT_COLORS),
});

// GET /api/habits/logs?month=2026-11: every mark in that month for the user.
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const month = new URL(request.url).searchParams.get('month');
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
  }

  try {
    await connectDB();
    const logs = await HabitLog.find({ userId, dateKey: { $regex: `^${month}-` } }).lean();
    return NextResponse.json({
      logs: logs.map((l) => ({ habitId: String(l.habitId), dateKey: l.dateKey, color: l.color })),
    });
  } catch (err) {
    console.error('GET /api/habits/logs failed', err);
    return NextResponse.json({ error: 'Could not load habit marks.' }, { status: 500 });
  }
}

// PUT /api/habits/logs: body { habitId, dateKey, color }. Creates the mark or changes its colour.
export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }
  const { habitId, dateKey, color } = parsed.data;

  try {
    await connectDB();
    const owns = await Habit.exists({ _id: habitId, userId });
    if (!owns) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

    const filter = { userId, habitId, dateKey };
    let log;
    try {
      log = await HabitLog.findOneAndUpdate(filter, { $set: { color } }, { new: true, upsert: true }).lean();
    } catch (err) {
      // Two quick taps can race to insert the same day. Retry as a plain update.
      if (typeof err !== 'object' || err === null || (err as { code?: unknown }).code !== 11000) throw err;
      log = await HabitLog.findOneAndUpdate(filter, { $set: { color } }, { new: true }).lean();
    }

    return NextResponse.json({ log: { habitId, dateKey, color: log?.color ?? color } });
  } catch (err) {
    console.error('PUT /api/habits/logs failed', err);
    return NextResponse.json({ error: 'Could not save the mark.' }, { status: 500 });
  }
}

// DELETE /api/habits/logs?habitId=...&date=YYYY-MM-DD: clears one day.
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const habitId = params.get('habitId') ?? '';
  const date = params.get('date');
  if (!mongoose.isValidObjectId(habitId) || !isDateKey(date)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await connectDB();
    await HabitLog.deleteOne({ userId, habitId, dateKey: date });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/habits/logs failed', err);
    return NextResponse.json({ error: 'Could not clear the day.' }, { status: 500 });
  }
}
