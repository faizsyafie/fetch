import { NextRequest, NextResponse } from "next/server";

const FEEDBACK_TO_EMAIL = "faizsyafie@gmail.com";
const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Feedback isn't configured yet." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const senderEmail = typeof body?.senderEmail === "string" ? body.senderEmail.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, MAX_TITLE_LENGTH) : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";

  if (!EMAIL_PATTERN.test(senderEmail) || !title || !message) {
    return NextResponse.json(
      { error: "A valid email, a title and a message are required." },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "fetch feedback <onboarding@resend.dev>",
      to: [FEEDBACK_TO_EMAIL],
      reply_to: senderEmail,
      subject: `[fetch feedback] ${title}`,
      text: `From: ${senderEmail}\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(senderEmail)}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    // Logged server-side (Vercel function logs) for diagnosing delivery
    // issues — Resend's error body has no secrets in it, just what went
    // wrong (bad/unverified sender, restricted recipient, etc).
    console.error("Resend send failed:", response.status, data);
    return NextResponse.json(
      {
        error:
          data?.message ||
          `Failed to send feedback (Resend responded ${response.status}).`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
