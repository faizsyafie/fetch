import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, hashAccessCode, signTeamCookie } from "@/lib/auth";
import { findTeamByPassphraseHash } from "@/lib/db";

export async function POST(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "This deployment is missing its SESSION_SECRET environment variable." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const submitted = typeof body?.code === "string" ? body.code : "";
  if (!submitted) {
    return NextResponse.json({ error: "Incorrect passphrase." }, { status: 401 });
  }

  const hash = await hashAccessCode(submitted);
  const team = await findTeamByPassphraseHash(hash).catch(() => null);
  if (!team) {
    return NextResponse.json({ error: "Incorrect passphrase." }, { status: 401 });
  }

  const cookieValue = await signTeamCookie(team.id, secret);
  const response = NextResponse.json({ ok: true, team: team.name });
  response.cookies.set(ACCESS_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
