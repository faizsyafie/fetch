import { NextRequest, NextResponse } from "next/server";
import { getProfilePreferences, saveProfilePreferences } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  try {
    const preferences = await getProfilePreferences(decodeURIComponent(name));
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
  const { name } = await params;
  try {
    const body = await request.json();
    await saveProfilePreferences(decodeURIComponent(name), body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save preferences." },
      { status: 500 }
    );
  }
}
