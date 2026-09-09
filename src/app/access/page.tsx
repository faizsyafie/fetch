"use client";

import { useState, type FormEvent } from "react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Incorrect passphrase.");
      }
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next || "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 dark:bg-brand-900">
      <div className="w-full max-w-sm rounded-lg border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-700 dark:bg-brand-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-light.png"
          alt="fetch"
          className="mx-auto block h-12 w-12 rounded-lg object-cover dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-dark.png"
          alt="fetch"
          className="mx-auto hidden h-12 w-12 rounded-lg object-cover dark:block"
        />

        <h1 className="mt-4 text-center text-lg font-bold text-brand-900 dark:text-white">
          Team access
        </h1>
        <p className="mt-1 text-center text-xs text-brand-500 dark:text-brand-400">
          Enter the shared passphrase to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            autoFocus
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Passphrase"
            className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-950 dark:text-white"
          />
          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !code}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
