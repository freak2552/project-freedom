import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";


export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.json(
      { message: "Could not log out. Please try again." },
      { status: 500 },
    );
  }
}