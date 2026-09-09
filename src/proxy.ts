import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, hashAccessCode } from "@/lib/auth";

// Gates the entire app (pages and API routes alike) behind one shared team
// passphrase (APP_ACCESS_CODE). This is not per-user auth — it's a single
// site-wide lock to keep the public internet out, since every profile's
// company watchlist is otherwise readable/writable by anyone who knows or
// guesses the profile name. /about and /access itself stay public.
export async function proxy(request: NextRequest) {
  const code = process.env.APP_ACCESS_CODE;

  // Misconfigured in production: fail closed rather than silently leaving
  // the whole app open because nobody set the env var yet.
  if (!code) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "This deployment is missing its APP_ACCESS_CODE environment variable.",
        },
        { status: 503 }
      );
    }
    // Local dev with no code set: don't force every contributor to set one.
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const expected = await hashAccessCode(code);
  if (cookie === expected) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL("/access", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|about|access|api/access|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
