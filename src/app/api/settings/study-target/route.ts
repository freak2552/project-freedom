import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { StudySettings } from "@/models/StudySettings";

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const StudyHoursSchema = z.number().min(0).max(24).multipleOf(0.5);
const SaveSettingsSchema = z
  .object({
    regularStudyHours: StudyHoursSchema,
    specialDays: z
      .array(
        z.object({
          date: z.string().refine(isValidDateKey, "Enter a valid date."),
          hours: StudyHoursSchema,
        }),
      )
      .max(2000),
  })
  .superRefine((settings, context) => {
    const dates = new Set<string>();
    settings.specialDays.forEach((specialDay, index) => {
      if (dates.has(specialDay.date)) {
        context.addIssue({
          code: "custom",
          path: ["specialDays", index, "date"],
          message: "Each date can have only one special target.",
        });
      }
      dates.add(specialDay.date);
    });
  });

function serialize(settings: {
  regularStudyHours: number;
  specialDays: Array<{ date: string; hours: number }>;
  updatedAt?: Date;
}) {
  return {
    regularStudyHours: settings.regularStudyHours,
    specialDays: settings.specialDays.map(({ date, hours }) => ({ date, hours })),
    updatedAt: settings.updatedAt ?? null,
  };
}

async function getUserId() {
  const user = await getCurrentUser();
  if (!user || !mongoose.isValidObjectId(user.id)) return null;
  return new mongoose.Types.ObjectId(user.id);
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Please log in." }, { status: 401 });
    }

    await connectToDatabase();
    const saved = await StudySettings.findOne({ userId }).lean();
    return NextResponse.json({
      settings: saved
        ? serialize(saved)
        : { regularStudyHours: 5, specialDays: [], updatedAt: null },
    });
  } catch (error) {
    console.error("Could not load study-target settings:", error);
    return NextResponse.json({ message: "Could not load study settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Please log in." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    const parsed = SaveSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Check the daily hours and special-day entries." }, { status: 400 });
    }

    await connectToDatabase();
    const update = {
      regularStudyHours: parsed.data.regularStudyHours,
      specialDays: parsed.data.specialDays,
    };

    let saved;
    try {
      saved = await StudySettings.findOneAndUpdate(
        { userId },
        { $set: update, $setOnInsert: { userId } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      // Concurrent first saves can race against the unique userId index.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === 11000
      ) {
        saved = await StudySettings.findOneAndUpdate(
          { userId },
          { $set: update },
          { new: true, runValidators: true },
        );
      } else {
        throw error;
      }
    }

    if (!saved) {
      return NextResponse.json({ message: "Could not save study settings." }, { status: 500 });
    }
    return NextResponse.json({ settings: serialize(saved) });
  } catch (error) {
    console.error("Could not save study-target settings:", error);
    return NextResponse.json({ message: "Could not save study settings." }, { status: 500 });
  }
}
