import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { Subject } from '@/models/Subject';

const createSchema = z.object({ name: z.string().trim().min(1).max(60) });

// Case-insensitive, so "Maths" and "maths" are the same subject.
const NAME_COLLATION = { locale: 'en', strength: 2 } as const;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const subjects = await Subject.find({ userId }).sort({ name: 1 }).lean();
    return NextResponse.json({
      subjects: subjects.map((s) => ({ id: String(s._id), name: s.name })),
    });
  } catch (err) {
    console.error('GET /api/subjects failed', err);
    return NextResponse.json({ error: 'Could not load subjects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const existing = await Subject.findOne({ userId, name: parsed.data.name })
      .collation(NAME_COLLATION)
      .lean();
    const subject =
      existing ?? (await Subject.create({ userId, name: parsed.data.name }));

    return NextResponse.json(
      { subject: { id: String(subject._id), name: subject.name } },
      { status: existing ? 200 : 201 },
    );
  } catch (err) {
    console.error('POST /api/subjects failed', err);
    return NextResponse.json({ error: 'Could not add the subject. Please try again.' }, { status: 500 });
  }
}
