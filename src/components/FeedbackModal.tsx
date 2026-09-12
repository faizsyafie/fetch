"use client";

import { useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface FeedbackModalProps {
  open: boolean;
  accent: AccentColor;
  onClose: () => void;
}

type Status = "idle" | "sending" | "sent" | "error";

export function FeedbackModal({ open, accent, onClose }: FeedbackModalProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const { mounted, closing } = useAnimatedModal(open);
  const [senderEmail, setSenderEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Stays mounted (invisible) between opens now — see useAnimatedModal —
  // so clear the form each time it's freshly reopened instead of showing
  // the last submission's leftovers.
  const [openTrackedFor, setOpenTrackedFor] = useState(open);
  if (open !== openTrackedFor) {
    setOpenTrackedFor(open);
    if (open) {
      setSenderEmail("");
      setTitle("");
      setMessage("");
      setStatus("idle");
      setErrorText(null);
    }
  }

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorText(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: senderEmail.trim(),
          title: title.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send feedback.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof Error ? err.message : "Failed to send feedback.");
    }
  }

  if (status === "sent") {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 ${closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"}`}
        onClick={onClose}
      >
        <div
          className={`w-full max-w-md rounded-lg border border-brand-200 bg-white p-6 text-center shadow-2xl dark:border-brand-700 dark:bg-brand-900 ${closing ? "animate-modal-panel-out" : "animate-modal-panel"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-3xl">🐾</p>
          <p className="mt-2 text-sm font-bold text-brand-900 dark:text-white">
            Thanks for the feedback!
          </p>
          <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
            It&rsquo;s on its way — I&rsquo;ll get back to you if you left an email.
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`mt-4 rounded-lg px-4 py-1.5 text-sm font-semibold text-white ${accentPreset.solid} ${accentPreset.solidHover}`}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 ${closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"}`}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900 ${closing ? "animate-modal-panel-out" : "animate-modal-panel"}`}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <h2 className="text-sm font-bold text-brand-900 dark:text-white">
            🐾 Feedback
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="text-xs text-brand-500 dark:text-brand-400">
            Are things ruff? Any suggestions and feedback are welcome — just
            write to me here.
          </p>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Your email
            </label>
            <input
              autoFocus
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this about?"
              maxLength={200}
              className={`w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Message
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me what's on your mind…"
              rows={5}
              maxLength={5000}
              className={`w-full resize-none rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
            />
          </div>

          {status === "error" && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {errorText}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-brand-200 px-4 py-3 dark:border-brand-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status === "sending" || !senderEmail.trim() || !title.trim() || !message.trim()}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
