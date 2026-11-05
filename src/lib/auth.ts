import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";
import { deleteSession } from "@/lib/session";

const SESSION_COOKIE_NAME = "project-freedom-session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type AuthenticatedUser = {
  id: string;
  username: string;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  await connectToDatabase();

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).select("userId");

  if (!session) {
    await deleteSession();
    return null;
  }

  const user = await User.findById(session.userId).select("username");

  if (!user) {
    await deleteSession();
    return null;
  }

  return {
    id: user._id.toString(),
    username: user.username,
  };
}