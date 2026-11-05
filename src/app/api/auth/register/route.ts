import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import User from "@/models/User";


const RegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          "Use a 3–20 character username (letters, numbers, _ or -) and a password of at least 8 characters.",
      },
      { status: 400 },
    );
  }

  const username = parsed.data.username.toLowerCase();

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ username }).select("_id");

    if (existingUser) {
      return NextResponse.json(
        { message: "That username is already taken." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({ username, passwordHash });

    await createSession(user._id.toString());

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // The unique index also handles two registrations racing for one username.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "That username is already taken." },
        { status: 409 },
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      { message: "Could not create your account. Please try again." },
      { status: 500 },
    );
  }
}