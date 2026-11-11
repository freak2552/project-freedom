import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Journey, JOURNEY_TYPE_IDS } from '@/models/Journey';

const createSchema = z.object({
  name: z.string().trim().min(1, 'Enter a journey name.').max(60, 'Name is too long.'),
  description: z.string().trim().max(200, 'Description is too long.').default(''),
  type: z.enum(JOURNEY_TYPE_IDS).default('general'),
});

type JourneyLike = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: string;
  entries?: { _id: mongoose.Types.ObjectId; date: Date; content: string }[];
};

// Shapes a stored journey for the browser. Not exported: route files may only export HTTP handlers.
function toJourney(j: JourneyLike) {
  return {
    id: String(j._id),
    name: j.name,
    description: j.description ?? '',
    type: j.type,
    entries: (j.entries ?? []).map((e) => ({
      id: String(e._id),
      date: new Date(e.date).toISOString(),
      content: e.content,
    })),
  };
}

// GET /api/journeys: all journeys for the user, newest first.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const journeys = await Journey.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ journeys: journeys.map(toJourney) });
  } catch (err) {
    console.error('GET /api/journeys failed', err);
    return NextResponse.json({ error: 'Could not load journeys.' }, { status: 500 });
  }
}

// POST /api/journeys: body { name, description?, type? }
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }

  try {
    await connectDB();
    const journey = await Journey.create({ userId, ...parsed.data, entries: [] });
    return NextResponse.json({ journey: toJourney(journey.toObject()) }, { status: 201 });
  } catch (err) {
    console.error('POST /api/journeys failed', err);
    return NextResponse.json({ error: 'Could not create the journey.' }, { status: 500 });
  }
}
