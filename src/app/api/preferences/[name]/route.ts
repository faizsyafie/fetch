import { NextRequest, NextResponse } from "next/server";
import { getProfilePreferences, saveProfilePreferences } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const teamId = request.headers.get("x-team-id");
  if (!teamId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { name } = await params;
  try {
    const preferences = await getProfilePreferences(
      decodeURIComponent(name),
      teamId
    );
    return NextResponse.json({ preferences });
  } catch {
    return NextResponse.json(
      { error: "Failed to load preferences." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const teamId = request.headers.get("x-team-id");
  if (!teamId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { name } = await params;
  try {
    const body = await request.json();
    await saveProfilePreferences(decodeURIComponent(name), body, teamId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save preferences." },
      { status: 500 }
    );
  }
}
