import { NextRequest, NextResponse } from "next/server";
import { hashAccessCode } from "@/lib/auth";
import { createTeam, listTeams } from "@/lib/db";

export async function GET() {
  try {
    const teams = await listTeams();
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ error: "Failed to load teams." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const passphrase =
    typeof body?.passphrase === "string" ? body.passphrase.trim() : "";
  if (!name || !passphrase) {
    return NextResponse.json(
      { error: "A team name and passphrase are required." },
      { status: 400 }
    );
  }

  try {
    const passphraseHash = await hashAccessCode(passphrase);
    const id = await createTeam(name, passphraseHash);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Failed to create team." }, { status: 500 });
  }
}
