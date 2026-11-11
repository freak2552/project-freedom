import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Journey } from '@/models/Journey';

// DELETE /api/journeys/:id/entries/:entryId: removes one entry.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, entryId } = await params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(entryId)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await connectDB();
    const result = await Journey.updateOne({ _id: id, userId }, { $pull: { entries: { _id: entryId } } });
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/journeys/[id]/entries/[entryId] failed', err);
    return NextResponse.json({ error: 'Could not delete the entry.' }, { status: 500 });
  }
}
