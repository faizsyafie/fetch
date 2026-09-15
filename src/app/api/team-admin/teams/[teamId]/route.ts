import { NextRequest, NextResponse } from "next/server";
import { hashAccessCode } from "@/lib/auth";
import { deleteTeam, renameTeam, resetTeamPassphrase } from "@/lib/db";

// Accepts either or both fields in one call — the admin UI sends whichever
// one the user actually edited (name-only for a rename, passphrase-only
// for a reset).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const passphrase =
    typeof body?.passphrase === "string" ? body.passphrase.trim() : undefined;

  if (!name && !passphrase) {
    return NextResponse.json(
      { error: "A new name or passphrase is required." },
      { status: 400 }
    );
  }

  try {
    if (name) {
      await renameTeam(teamId, name);
    }
    if (passphrase) {
      const passphraseHash = await hashAccessCode(passphrase);
      await resetTeamPassphrase(teamId, passphraseHash);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update team." },
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
