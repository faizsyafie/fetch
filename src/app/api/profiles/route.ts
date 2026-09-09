import { NextResponse } from "next/server";
import { listProfileNames } from "@/lib/db";

export async function GET() {
  try {
    const profiles = await listProfileNames();
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json(
      { error: "Failed to load team profiles." },
      { status: 500 }
    );
  }
}
