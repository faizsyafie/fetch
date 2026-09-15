import { NextRequest, NextResponse } from "next/server";
import { moveProfileToTeam } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const body = await request.json().catch(() => ({}));
  const teamId = typeof body?.teamId === "string" ? body.teamId : "";
  if (!teamId) {
    return NextResponse.json(
      { error: "A target team is required." },
      { status: 400 }
    );
  }

  try {
    await moveProfileToTeam(decodeURIComponent(name), teamId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to move profile." }, { status: 500 });
  }
}
