import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { isDateKey } from '@/lib/dates';
import { DiaryEntry } from '@/models/DiaryEntry';

const saveSchema = z.object({
  dateKey: z.string().refine(isDateKey, 'Invalid date'),
  text: z.string().trim().min(1, 'Write something before saving.').max(5000, 'Diary entry is too long.'),
});

// Diary entry for one day, e.g. GET /api/study/diary?date=2026-11-09
// Returns { text: null } when nothing is saved for that day.
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = new URL(request.url).searchParams.get('date');
  if (!isDateKey(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  try {
    await connectDB();
    const entry = await DiaryEntry.findOne({ userId, dateKey: date }).lean();
    return NextResponse.json({ text: entry?.text ?? null });
  } catch (err) {
    console.error('GET /api/study/diary failed', err);
    return NextResponse.json({ error: 'Could not load your diary.' }, { status: 500 });
  }
}

// Save or edit the diary for a day. Creates the entry or updates it.
export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }
  const { dateKey, text } = parsed.data;

  try {
    await connectDB();
    const entry = await DiaryEntry.findOneAndUpdate(
      { userId, dateKey },
      { $set: { text } },
      { new: true, upsert: true },
    ).lean();
    return NextResponse.json({ text: entry?.text ?? text });
  } catch (err) {
    console.error('PUT /api/study/diary failed', err);
    return NextResponse.json({ error: 'Could not save your diary.' }, { status: 500 });
  }
}

// Delete the diary entry for a day, e.g. DELETE /api/study/diary?date=2026-11-09
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = new URL(request.url).searchParams.get('date');
  if (!isDateKey(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  try {
    await connectDB();
    await DiaryEntry.deleteOne({ userId, dateKey: date });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/study/diary failed', err);
    return NextResponse.json({ error: 'Could not delete the entry.' }, { status: 500 });
  }
}
