import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ACCESS_COOKIE_NAME, hashAccessCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const expectedCode = process.env.ADMIN_ACCESS_CODE;
  if (!expectedCode) {
    return NextResponse.json(
      { error: "This deployment is missing its ADMIN_ACCESS_CODE environment variable." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const submitted = typeof body?.code === "string" ? body.code : "";

  if (submitted !== expectedCode) {
    return NextResponse.json({ error: "Incorrect passphrase." }, { status: 401 });
  }

  const token = await hashAccessCode(expectedCode);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Shorter-lived than a team session — this credential can see and
    // move every team's data, so it's worth re-entering more often.
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
