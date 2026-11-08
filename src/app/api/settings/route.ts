import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { StudySettings } from '@/models/StudySettings';

const DEFAULT_DAILY_HOURS = 5;

const updateSchema = z.object({
  dailyTargetHours: z.number().min(0).max(24),
});

// Returns the normal daily target and all special-day targets for the signed-in user.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const settings = await StudySettings.findOne({ userId }).lean();

  return NextResponse.json({
    dailyTargetHours: settings?.dailyTargetHours ?? DEFAULT_DAILY_HOURS,
    specialDays: (settings?.specialDays ?? {}) as Record<string, number>,
  });
}

// Updates the normal daily target.
export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Daily target must be between 0 and 24 hours' }, { status: 400 });
  }

  await connectDB();
  const settings = await StudySettings.findOneAndUpdate(
    { userId },
    { $set: { dailyTargetHours: parsed.data.dailyTargetHours } },
    { new: true, upsert: true },
  ).lean();

  return NextResponse.json({
    dailyTargetHours: settings.dailyTargetHours,
    specialDays: (settings.specialDays ?? {}) as Record<string, number>,
  });
}
