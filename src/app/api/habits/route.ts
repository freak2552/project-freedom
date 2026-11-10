import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Habit } from '@/models/Habit';

const createSchema = z.object({
  name: z.string().trim().min(1, 'Enter a habit name.').max(40, 'Habit name is too long.'),
});

// GET /api/habits: all habits for the user, oldest first.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const habits = await Habit.find({ userId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({
      habits: habits.map((h) => ({ id: String(h._id), name: h.name })),
    });
  } catch (err) {
    console.error('GET /api/habits failed', err);
    return NextResponse.json({ error: 'Could not load habits.' }, { status: 500 });
  }
}

// POST /api/habits: body { name }
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  }

  try {
    await connectDB();
    const habit = await Habit.create({ userId, name: parsed.data.name });
    return NextResponse.json({ habit: { id: String(habit._id), name: habit.name } }, { status: 201 });
  } catch (err) {
    console.error('POST /api/habits failed', err);
    return NextResponse.json({ error: 'Could not add the habit.' }, { status: 500 });
  }
}
