import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Habit } from '@/models/Habit';
import { HabitLog } from '@/models/HabitLog';

// DELETE /api/habits/:id: removes the habit and all its marks.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid habit' }, { status: 400 });

  try {
    await connectDB();
    const result = await Habit.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

    await HabitLog.deleteMany({ userId, habitId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/habits/[id] failed', err);
    return NextResponse.json({ error: 'Could not delete the habit.' }, { status: 500 });
  }
}
