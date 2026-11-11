import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Journey } from '@/models/Journey';

const MAX_ENTRIES = 1000; // keeps one journey document from growing without limit

const entrySchema = z.object({
  content: z.string().trim().min(1, 'Write something first.').max(1000, 'Entry is too long.'),
});

// POST /api/journeys/:id/entries: body { content }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid journey' }, { status: 400 });

  const parsed = entrySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }

  try {
    await connectDB();
    const entryId = new mongoose.Types.ObjectId();
    const date = new Date();

    // Adds only if the journey belongs to this user and has room (no entry at position MAX_ENTRIES - 1).
    const result = await Journey.updateOne(
      { _id: id, userId, [`entries.${MAX_ENTRIES - 1}`]: { $exists: false } },
      { $push: { entries: { _id: entryId, content: parsed.data.content, date } } },
    );

    if (result.matchedCount === 0) {
      const exists = await Journey.exists({ _id: id, userId });
      if (!exists) return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
      return NextResponse.json({ error: `This journey is full (${MAX_ENTRIES} entries).` }, { status: 409 });
    }

    return NextResponse.json(
      { entry: { id: String(entryId), date: date.toISOString(), content: parsed.data.content } },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/journeys/[id]/entries failed', err);
    return NextResponse.json({ error: 'Could not save the entry.' }, { status: 500 });
  }
}
