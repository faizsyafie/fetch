import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ADMIN_ACCESS_COOKIE_NAME,
  hashAccessCode,
  verifyTeamCookie,
} from "@/lib/auth";

// Two independent gates:
//
// 1. Every team-facing route requires a valid team session — a cookie of
//    the form "<teamId>.<hmac>" that only the server (knowing
//    SESSION_SECRET) could have signed, minted by /api/access after
//    checking a submitted passphrase against the `teams` table. Verifying
//    it here only needs the HMAC (Web Crypto, edge-safe) — no DB
//    round-trip in the edge runtime — and the verified teamId is forwarded
//    as an x-team-id header so downstream Node routes can scope
//    profiles/preferences to that team.
//
// 2. /team-admin (page + API) is gated separately by ADMIN_ACCESS_CODE, a
//    completely different credential from any team's own passphrase —
//    deliberately not reachable via a team session, since it can see and
//    move every team's data.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/team-admin") || pathname.startsWith("/api/team-admin")) {
    return handleAdminGate(request);
  }

  return handleTeamGate(request);
}

async function handleAdminGate(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const code = process.env.ADMIN_ACCESS_CODE;

  if (!code) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "This deployment is missing its ADMIN_ACCESS_CODE environment variable.",
        },
        { status: 503 }
      );
    }
    return NextResponse.next();
  }

  // The login endpoint itself must be reachable while unauthenticated.
  if (pathname === "/api/team-admin/access") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_ACCESS_COOKIE_NAME)?.value;
  const expected = await hashAccessCode(code);
  if (cookie === expected) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // The /team-admin page itself renders its own passphrase form when its
  // own fetch to the teams API comes back 401 — no redirect needed.
  return NextResponse.next();
}

async function handleTeamGate(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "This deployment is missing its SESSION_SECRET environment variable.",
        },
        { status: 503 }
      );
    }
    // Local dev with no SESSION_SECRET configured: don't force every
    // contributor to set one, same as the old single-passphrase gate used
    // to no-op when APP_ACCESS_CODE wasn't set — but still forward a fixed
    // dev-only team id (seeded in db.ts, kept out of production) so
    // profile save/load routes, which now require x-team-id, keep working.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-team-id", "dev-local");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const cookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const teamId = cookie ? await verifyTeamCookie(cookie, secret) : null;

  if (teamId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-team-id", teamId);
    return NextResponse.next({ request: { headers: requestHeaders } });
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
    "/((?!_next/static|_next/image|favicon\\.ico|access|api/access|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
