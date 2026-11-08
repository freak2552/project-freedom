import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { StudyRecord } from '@/models/StudyRecord';

const updateSchema = z.object({ minutes: z.number().int().min(0).max(1440) });

type Params = { params: Promise<{ id: string }> };

// Edit the logged minutes of one record.
export async function PATCH(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Minutes must be 0 to 1440' }, { status: 400 });
  }

  await connectDB();
  const record = await StudyRecord.findOneAndUpdate(
    { _id: id, userId },
    { $set: { minutes: parsed.data.minutes } },
    { new: true },
  ).lean();
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    record: {
      id: String(record._id),
      subjectId: String(record.subjectId),
      subjectName: record.subjectName,
      dateKey: record.dateKey,
      minutes: record.minutes,
    },
  });
}

// Delete one record.
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await connectDB();
  const result = await StudyRecord.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
