import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, hashAccessCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const expectedCode = process.env.APP_ACCESS_CODE;
  if (!expectedCode) {
    return NextResponse.json(
      { error: "This deployment is missing its APP_ACCESS_CODE." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const submitted = typeof body?.code === "string" ? body.code : "";

  if (submitted !== expectedCode) {
    return NextResponse.json(
      { error: "Incorrect passphrase." },
      { status: 401 }
    );
  }

  const token = await hashAccessCode(expectedCode);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
