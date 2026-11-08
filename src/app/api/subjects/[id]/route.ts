import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Subject } from '@/models/Subject';
import { StudyRecord } from '@/models/StudyRecord';

const updateSchema = z.object({ name: z.string().trim().min(1).max(60) });

type Params = { params: Promise<{ id: string }> };

// Rename: the subject and all of its historical records show the new name.
export async function PATCH(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
  }

  await connectDB();
  const subject = await Subject.findOneAndUpdate(
    { _id: id, userId },
    { $set: { name: parsed.data.name } },
    { new: true },
  );
  if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await StudyRecord.updateMany(
    { userId, subjectId: subject._id },
    { $set: { subjectName: subject.name } },
  );

  return NextResponse.json({ subject: { id: String(subject._id), name: subject.name } });
}

// Delete: removes the subject from the list but keeps its study records.
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await connectDB();
  const result = await Subject.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
