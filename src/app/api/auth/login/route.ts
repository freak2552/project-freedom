import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import User from "@/models/User";


const LoginSchema = z.object({
  username: z.string().trim().min(1).max(20),
  password: z.string().min(1).max(72),
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

  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter your username and password." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({
      username: parsed.data.username.toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    const passwordMatches = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    await createSession(user._id.toString());

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { message: "Could not log in. Please try again." },
      { status: 500 },
    );
  }
}