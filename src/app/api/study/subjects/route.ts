import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getStudyUserId, isDuplicateKeyError } from "@/lib/study-api";
import { StudyRecord } from "@/models/StudyRecord";
import StudySubject from "@/models/StudySubject";

type RouteContext = { params: Promise<{ subjectId: string }> };
const RenameSubjectSchema = z.object({
  name: z.string().trim().min(1).max(40),
});

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getStudyUserId();
  if (!userId) return NextResponse.json({ message: "Please log in." }, { status: 401 });

  const { subjectId } = await context.params;
  if (!mongoose.isValidObjectId(subjectId)) {
    return NextResponse.json({ message: "Invalid subject id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
  const parsed = RenameSubjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Subject name must be between 1 and 40 characters." }, { status: 400 });
  }

  const name = parsed.data.name;
  try {
    await connectToDatabase();
    const subject = await StudySubject.findOne({ _id: subjectId, userId });
    if (!subject) return NextResponse.json({ message: "Subject not found." }, { status: 404 });

    subject.name = name;
    subject.normalizedName = name.toLocaleLowerCase();
    await subject.save();

    await StudyRecord.updateMany(
      { userId, subjectId: new mongoose.Types.ObjectId(subjectId) },
      { $set: { subjectName: name } },
    );

    return NextResponse.json({
      subject: { id: subject._id.toString(), name: subject.name, createdAt: subject.createdAt },
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ message: "You already have a subject with that name." }, { status: 409 });
    }
    console.error("Could not rename study subject:", error);
    return NextResponse.json({ message: "Could not rename subject." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await getStudyUserId();
  if (!userId) return NextResponse.json({ message: "Please log in." }, { status: 401 });

  const { subjectId } = await context.params;
  if (!mongoose.isValidObjectId(subjectId)) {
    return NextResponse.json({ message: "Invalid subject id." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const result = await StudySubject.deleteOne({ _id: subjectId, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Subject not found." }, { status: 404 });
    }
    // Records keep their subjectName snapshot and are intentionally retained.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete study subject:", error);
    return NextResponse.json({ message: "Could not delete subject." }, { status: 500 });
  }
}
