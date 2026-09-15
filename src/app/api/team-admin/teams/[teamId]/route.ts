import { NextRequest, NextResponse } from "next/server";
import { hashAccessCode } from "@/lib/auth";
import { deleteTeam, resetTeamPassphrase } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const body = await request.json().catch(() => ({}));
  const passphrase =
    typeof body?.passphrase === "string" ? body.passphrase.trim() : "";
  if (!passphrase) {
    return NextResponse.json(
      { error: "A new passphrase is required." },
      { status: 400 }
    );
  }

  try {
    const passphraseHash = await hashAccessCode(passphrase);
    await resetTeamPassphrase(teamId, passphraseHash);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset passphrase." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  try {
    const result = await deleteTeam(teamId);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete team." }, { status: 500 });
  }
}
