import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { isDateKey } from '@/lib/dates';
import { MOOD_VALUES, MoodEntry } from '@/models/MoodEntry';

const saveSchema = z.object({
  dateKey: z.string().refine(isDateKey, 'Invalid date'),
  mood: z.enum(MOOD_VALUES),
});

// Mood for one day, e.g. GET /api/study/mood?date=2026-11-09
// Returns { mood: null } when nothing is saved for that day.
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = new URL(request.url).searchParams.get('date');
  if (!isDateKey(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  try {
    await connectDB();
    const entry = await MoodEntry.findOne({ userId, dateKey: date }).lean();
    return NextResponse.json({ mood: entry?.mood ?? null });
  } catch (err) {
    console.error('GET /api/study/mood failed', err);
    return NextResponse.json({ error: 'Could not load your mood.' }, { status: 500 });
  }
}

// Save or edit the mood for a day. Both use the same call: it creates the entry or updates it.
export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }
  const { dateKey, mood } = parsed.data;

  try {
    await connectDB();
    const entry = await MoodEntry.findOneAndUpdate(
      { userId, dateKey },
      { $set: { mood } },
      { new: true, upsert: true },
    ).lean();
    return NextResponse.json({ mood: entry?.mood ?? mood });
  } catch (err) {
    console.error('PUT /api/study/mood failed', err);
    return NextResponse.json({ error: 'Could not save your mood.' }, { status: 500 });
  }
}
