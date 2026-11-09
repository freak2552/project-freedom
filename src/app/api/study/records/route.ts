import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { isDateKey } from '@/lib/dates';
import { Subject } from '@/models/Subject';
import { StudyRecord } from '@/models/StudyRecord';

const saveSchema = z.object({
  subjectId: z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid subject'),
  dateKey: z.string().refine(isDateKey, 'Invalid date'),
  minutes: z.number().int().min(1).max(1440),
});

function toRecord(r: {
  _id: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  subjectName: string;
  dateKey: string;
  minutes: number;
}) {
  return {
    id: String(r._id),
    subjectId: String(r.subjectId),
    subjectName: r.subjectName,
    dateKey: r.dateKey,
    minutes: r.minutes,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

// Records for one day, e.g. GET /api/study/records?date=2026-10-27
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = new URL(request.url).searchParams.get('date');
  if (!isDateKey(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  try {
    await connectDB();
    const records = await StudyRecord.find({ userId, dateKey: date }).sort({ subjectName: 1 }).lean();
    return NextResponse.json({ records: records.map(toRecord) });
  } catch (err) {
    console.error('GET /api/study/records failed', err);
    return NextResponse.json({ error: 'Could not load records' }, { status: 500 });
  }
}

// Saving adds minutes to the subject's record for that date, creating it if needed.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }
  const { subjectId, dateKey, minutes } = parsed.data;

  try {
    await connectDB();
    const subject = await Subject.findOne({ _id: subjectId, userId }).lean();
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    const filter = { userId, dateKey, subjectId: subject._id };
    const update = { $inc: { minutes }, $set: { subjectName: subject.name } };

    let record;
    try {
      record = await StudyRecord.findOneAndUpdate(filter, update, { new: true, upsert: true }).lean();
    } catch (err) {
      // Two saves for the same subject and date at once can both try to insert.
      // If one already created the row, retry as a plain update.
      if (!isDuplicateKeyError(err)) throw err;
      record = await StudyRecord.findOneAndUpdate(filter, update, { new: true }).lean();
    }

    if (!record) {
      return NextResponse.json({ error: 'Could not save the study time. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ record: toRecord(record) }, { status: 201 });
  } catch (err) {
    console.error('POST /api/study/records failed', err);
    return NextResponse.json({ error: 'Could not save the study time. Please try again.' }, { status: 500 });
  }
}
