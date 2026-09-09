"use client";

import { useEffect, useState } from "react";

interface ProfilePickerProps {
  onPick: (name: string) => void;
}

export function ProfilePicker({ onPick }: ProfilePickerProps) {
  const [name, setName] = useState("");
  const [existingProfiles, setExistingProfiles] = useState<string[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profiles")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { profiles: string[] }) => {
        if (!cancelled) setExistingProfiles(data.profiles);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) onPick(name.trim());
  }

  return (
    <div className="flex h-screen items-center justify-center bg-brand-100 px-4 dark:bg-brand-950">
      <div className="w-full max-w-sm rounded-lg border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900">
        <h1 className="text-lg font-bold text-brand-900 dark:text-white">
          Who&rsquo;s viewing?
        </h1>
        <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
          Your team&rsquo;s watchlist, industries, and sources sync under
          this name. No password — just pick or type your name.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-950 dark:text-white"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </form>

        {existingProfiles.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Or pick an existing profile
            </p>
            <div className="flex flex-wrap gap-1.5">
              {existingProfiles.map((profile) => (
                <button
                  key={profile}
                  type="button"
                  onClick={() => onPick(profile)}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-200 dark:hover:bg-brand-700"
                >
                  {profile}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadError && (
          <p className="mt-3 text-[11px] text-amber-600 dark:text-amber-400">
            Couldn&rsquo;t reach the shared database — you can still continue, but
            your changes may only be saved locally.
          </p>
        )}
      </div>
    </div>
  );
}
