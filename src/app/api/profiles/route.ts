import { NextRequest, NextResponse } from "next/server";
import { listProfileNamesForTeam } from "@/lib/db";

export async function GET(request: NextRequest) {
  const teamId = request.headers.get("x-team-id");
  if (!teamId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  try {
    const profiles = await listProfileNamesForTeam(teamId);
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json(
      { error: "Failed to load team profiles." },
      { status: 500 }
    );
  }
}
