import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Journey } from '@/models/Journey';

// DELETE /api/journeys/:id: removes the journey and all its entries.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid journey' }, { status: 400 });

  try {
    await connectDB();
    const result = await Journey.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/journeys/[id] failed', err);
    return NextResponse.json({ error: 'Could not delete the journey.' }, { status: 500 });
  }
}
