"use client";

import { useEffect, useState } from "react";

interface ProfileEntry {
  name: string;
  updatedAt: string;
}

interface TeamEntry {
  id: string;
  name: string;
  createdAt: string;
  profiles: ProfileEntry[];
}

function randomPassphrase(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

export default function TeamAdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [moveTarget, setMoveTarget] = useState<Record<string, string>>({});
  const [resettingTeamId, setResettingTeamId] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState("");
  const [renamingTeamId, setRenamingTeamId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPassphrase, setNewTeamPassphrase] = useState("");

  async function loadTeams() {
    const res = await fetch("/api/team-admin/teams");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setLoadError("Failed to load teams.");
      setAuthed(true);
      return;
    }
    const data: { teams: TeamEntry[] } = await res.json();
    setTeams(data.teams);
    setLoadError(null);
    setAuthed(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/team-admin/teams")
      .then((res) => {
        if (res.status === 401) {
          if (!cancelled) setAuthed(false);
          return null;
        }
        if (!res.ok) {
          if (!cancelled) {
            setLoadError("Failed to load teams.");
            setAuthed(true);
          }
          return null;
        }
        return res.json();
      })
      .then((data: { teams: TeamEntry[] } | null) => {
        if (cancelled || !data) return;
        setTeams(data.teams);
        setLoadError(null);
        setAuthed(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Failed to load teams.");
          setAuthed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/team-admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Incorrect passphrase.");
      }
      setCode("");
      await loadTeams();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    const passphrase = newTeamPassphrase.trim();
    if (!name || !passphrase) return;
    setActionError(null);
    try {
      const res = await fetch("/api/team-admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, passphrase }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create team.");
      }
      setNewTeamName("");
      setNewTeamPassphrase("");
      setNewTeamOpen(false);
      await loadTeams();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create team.");
    }
  }

  async function handleResetPassphrase(teamId: string) {
    const passphrase = resetValue.trim();
    if (!passphrase) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/team-admin/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to reset passphrase.");
      }
      setResettingTeamId(null);
      setResetValue("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reset passphrase.");
    }
  }

  async function handleRenameTeam(teamId: string) {
    const name = renameValue.trim();
    if (!name) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/team-admin/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to rename team.");
      }
      setRenamingTeamId(null);
      setRenameValue("");
      await loadTeams();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to rename team.");
    }
  }

  async function handleDeleteTeam(teamId: string) {
    setActionError(null);
    try {
      const res = await fetch(`/api/team-admin/teams/${teamId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete team.");
      }
      await loadTeams();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete team.");
    }
  }

  async function handleMoveProfile(name: string) {
    const teamId = moveTarget[name];
    if (!teamId) return;
    setActionError(null);
    try {
      const res = await fetch(
        `/api/team-admin/profiles/${encodeURIComponent(name)}/move`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to move profile.");
      }
      setMoveTarget((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      await loadTeams();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to move profile.");
    }
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 dark:bg-brand-900">
        <p className="text-sm text-brand-400 dark:text-brand-600">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 dark:bg-brand-900">
        <div className="w-full max-w-sm rounded-lg border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-700 dark:bg-brand-800">
          <h1 className="text-lg font-bold text-brand-900 dark:text-white">
            🔐 Team Admin
          </h1>
          <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
            This is a separate credential from any team&rsquo;s own passphrase.
          </p>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              autoFocus
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Admin passphrase"
              className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-950 dark:text-white"
            />
            {loginError && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {loginError}
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

  return (
    <div className="min-h-screen bg-brand-100 px-4 py-8 dark:bg-brand-950 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-brand-900 dark:text-white">
              🔐 Team Admin
            </h1>
            <p className="mt-1 max-w-md text-xs text-brand-500 dark:text-brand-400">
              Manage passphrases and which profiles belong to which team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNewTeamOpen((v) => !v)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            + New team
          </button>
        </div>

        {loadError && (
          <p className="mb-4 text-xs font-medium text-red-600 dark:text-red-400">
            {loadError}
          </p>
        )}
        {actionError && (
          <p className="mb-4 text-xs font-medium text-red-600 dark:text-red-400">
            ⚠️ {actionError}
          </p>
        )}

        <div className="space-y-4">
          {teams.map((team) => {
            const isOpen = expanded.has(team.id);
            return (
              <div
                key={team.id}
                className="overflow-hidden rounded-lg border border-brand-200 bg-white dark:border-brand-700 dark:bg-brand-900"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div
                    onClick={() => toggleExpanded(team.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                  >
                    <span className="text-xs text-brand-400 dark:text-brand-600">
                      {isOpen ? "▾" : "▸"}
                    </span>
                    <div className="min-w-0 flex-1">
                      {renamingTeamId === team.id ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="w-44 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-sm font-bold text-brand-900 outline-none dark:border-brand-700 dark:bg-brand-950 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameTeam(team.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingTeamId(null);
                              setRenameValue("");
                            }}
                            className="text-xs font-medium text-brand-400 hover:text-brand-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-brand-900 dark:text-white">
                            {team.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingTeamId(team.id);
                              setRenameValue(team.name);
                            }}
                            title="Rename team"
                            className="shrink-0 text-[0.6875rem] text-brand-400 hover:text-brand-600 dark:text-brand-600 dark:hover:text-brand-300"
                          >
                            ✎
                          </button>
                          <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-brand-600 dark:bg-brand-800 dark:text-brand-300">
                            {team.profiles.length}{" "}
                            {team.profiles.length === 1 ? "profile" : "profiles"}
                          </span>
                        </div>
                      )}
                      <p className="text-[0.6875rem] text-brand-400 dark:text-brand-600">
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {resettingTeamId === team.id ? (
                      <>
                        <input
                          autoFocus
                          value={resetValue}
                          onChange={(e) => setResetValue(e.target.value)}
                          placeholder="New passphrase"
                          className="w-32 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs text-brand-900 outline-none dark:border-brand-700 dark:bg-brand-950 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleResetPassphrase(team.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResettingTeamId(null);
                            setResetValue("");
                          }}
                          className="text-xs font-medium text-brand-400 hover:text-brand-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 font-mono text-xs tracking-widest text-brand-400 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-600">
                          ••••••••
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setResettingTeamId(team.id);
                            setResetValue("");
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                        >
                          Reset passphrase
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(team.id)}
                          disabled={team.profiles.length > 0}
                          title={
                            team.profiles.length > 0
                              ? "Move its profiles out first"
                              : "Delete this team"
                          }
                          className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isOpen && team.profiles.length > 0 && (
                  <div className="border-t border-brand-100 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/40">
                    {team.profiles.map((profile) => (
                      <div
                        key={profile.name}
                        className="flex items-center justify-between gap-3 border-b border-brand-100 px-4 py-2.5 pl-11 last:border-b-0 dark:border-brand-800"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-brand-900 dark:text-white">
                            {profile.name}
                          </p>
                          <p className="text-[0.6875rem] text-brand-400 dark:text-brand-600">
                            Updated {new Date(profile.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <select
                            value={moveTarget[profile.name] ?? ""}
                            onChange={(e) =>
                              setMoveTarget((prev) => ({
                                ...prev,
                                [profile.name]: e.target.value,
                              }))
                            }
                            className="rounded-md border border-brand-200 bg-white px-2 py-1 text-xs text-brand-700 outline-none dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200"
                          >
                            <option value="">Move to…</option>
                            {teams
                              .filter((t) => t.id !== team.id)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleMoveProfile(profile.name)}
                            disabled={!moveTarget[profile.name]}
                            className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Move
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {newTeamOpen && (
          <form
            onSubmit={handleCreateTeam}
            className="mt-4 space-y-3 rounded-lg border border-dashed border-brand-300 bg-white p-4 dark:border-brand-600 dark:bg-brand-900"
          >
            <div>
              <label className="mb-1 block text-[0.6875rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                Team name
              </label>
              <input
                autoFocus
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Marketing"
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-950 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.6875rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                Passphrase
              </label>
              <input
                value={newTeamPassphrase}
                onChange={(e) => setNewTeamPassphrase(e.target.value)}
                placeholder="Choose one, or generate below"
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-950 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setNewTeamPassphrase(randomPassphrase())}
                className="mt-1.5 text-[0.6875rem] font-semibold text-blue-600 hover:text-blue-500"
              >
                🎲 Generate a random passphrase
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNewTeamOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTeamName.trim() || !newTeamPassphrase.trim()}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create team
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
