import { randomUUID } from "crypto";
import { Pool } from "pg";
import { hashAccessCode } from "@/lib/auth";

declare global {
  var __newstrackerPgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global.__newstrackerPgPool) {
    global.__newstrackerPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
  }
  return global.__newstrackerPgPool;
}

let schemaReady: Promise<void> | null = null;

// One-time migration for deployments that predate multi-team support: if
// no teams exist yet, seed a "Default team" — using the legacy
// APP_ACCESS_CODE as its passphrase when set, so anyone who already knew
// the old shared passphrase keeps working without having to be told a new
// one — and move every existing (team-less) profile into it.
// Fixed id proxy.ts falls back to when SESSION_SECRET isn't set locally
// (mirrors how the old single-passphrase gate used to no-op entirely when
// APP_ACCESS_CODE wasn't configured for local dev) — kept out of
// production so it never appears as a real, selectable team there.
const DEV_FALLBACK_TEAM_ID = "dev-local";

async function seedDefaultTeamIfNeeded(): Promise<void> {
  const pool = getPool();

  if (process.env.NODE_ENV !== "production") {
    await pool.query(
      `INSERT INTO teams (id, name, passphrase_hash)
       VALUES ($1, 'Local dev', '')
       ON CONFLICT (id) DO NOTHING`,
      [DEV_FALLBACK_TEAM_ID]
    );
  }

  const { rows } = await pool.query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM teams WHERE id != $1",
    [DEV_FALLBACK_TEAM_ID]
  );
  if (rows[0].count > 0) return;

  const legacyCode = process.env.APP_ACCESS_CODE;
  const passphraseHash = await hashAccessCode(legacyCode || randomUUID());
  const id = randomUUID();
  await pool.query(
    "INSERT INTO teams (id, name, passphrase_hash) VALUES ($1, $2, $3)",
    [id, "Default team", passphraseHash]
  );
  await pool.query(
    "UPDATE profiles SET team_id = $1 WHERE team_id IS NULL OR team_id = $2",
    [id, DEV_FALLBACK_TEAM_ID]
  );
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS profiles (
          name TEXT PRIMARY KEY,
          preferences JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`
      )
      .then(() =>
        getPool().query(
          `CREATE TABLE IF NOT EXISTS teams (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            passphrase_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`
        )
      )
      .then(() =>
        getPool().query(
          `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id TEXT REFERENCES teams(id)`
        )
      )
      .then(() =>
        // Deliberately NOT team-scoped: a URL's real content (or where its
        // Google News wrapper actually points) is a fact about that URL,
        // not about who's asking — sharing this cache across every team
        // means the first person anywhere to open a given article pays the
        // resolve/fetch/parse cost once, and everyone else after them
        // (same team or not) gets it instantly. Only successes are ever
        // stored (see the two set* functions below) — a transient failure
        // never gets cached, so a fixed bug or a site coming back online
        // is picked up on the very next attempt rather than staying stuck
        // behind a stale cached error.
        getPool().query(
          `CREATE TABLE IF NOT EXISTS resolved_articles (
            source_url TEXT PRIMARY KEY,
            resolved_url TEXT,
            title TEXT,
            byline TEXT,
            site_name TEXT,
            content TEXT,
            resolved_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`
        )
      )
      .then(() => seedDefaultTeamIfNeeded())
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

export async function listProfileNamesForTeam(
  teamId: string
): Promise<string[]> {
  await ensureSchema();
  const result = await getPool().query<{ name: string }>(
    "SELECT name FROM profiles WHERE team_id = $1 ORDER BY name ASC",
    [teamId]
  );
  return result.rows.map((row) => row.name);
}

// Scoped to teamId as a safety net (in addition to proxy.ts's own gate) —
// returns null for a profile that exists but belongs to a different team,
// same as "not found", so a caller can never distinguish "wrong team" from
// "doesn't exist".
export async function getProfilePreferences(
  name: string,
  teamId: string
): Promise<unknown | null> {
  await ensureSchema();
  const result = await getPool().query<{
    preferences: unknown;
    team_id: string | null;
  }>("SELECT preferences, team_id FROM profiles WHERE name = $1", [name]);
  const row = result.rows[0];
  if (!row || row.team_id !== teamId) return null;
  return row.preferences;
}

// team_id is only applied on first INSERT (a brand-new profile name) — on
// conflict, only preferences/updated_at are touched, so an existing
// profile's team assignment is never silently overwritten by a save.
export async function saveProfilePreferences(
  name: string,
  preferences: unknown,
  teamId: string
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO profiles (name, preferences, team_id, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (name)
     DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = now()`,
    [name, preferences, teamId]
  );
}

export interface TeamProfile {
  name: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  profiles: TeamProfile[];
}

export async function listTeams(): Promise<Team[]> {
  await ensureSchema();
  const teamsResult = await getPool().query<{
    id: string;
    name: string;
    created_at: string;
  }>("SELECT id, name, created_at FROM teams ORDER BY created_at ASC");
  const profilesResult = await getPool().query<{
    name: string;
    team_id: string;
    updated_at: string;
  }>(
    "SELECT name, team_id, updated_at FROM profiles WHERE team_id IS NOT NULL ORDER BY name ASC"
  );
  return teamsResult.rows.map((team) => ({
    id: team.id,
    name: team.name,
    createdAt: team.created_at,
    profiles: profilesResult.rows
      .filter((p) => p.team_id === team.id)
      .map((p) => ({ name: p.name, updatedAt: p.updated_at })),
  }));
}

export async function findTeamByPassphraseHash(
  passphraseHash: string
): Promise<{ id: string; name: string } | null> {
  await ensureSchema();
  const result = await getPool().query<{ id: string; name: string }>(
    "SELECT id, name FROM teams WHERE passphrase_hash = $1 LIMIT 1",
    [passphraseHash]
  );
  return result.rows[0] ?? null;
}

export async function createTeam(
  name: string,
  passphraseHash: string
): Promise<string> {
  await ensureSchema();
  const id = randomUUID();
  await getPool().query(
    "INSERT INTO teams (id, name, passphrase_hash) VALUES ($1, $2, $3)",
    [id, name, passphraseHash]
  );
  return id;
}

export async function resetTeamPassphrase(
  teamId: string,
  passphraseHash: string
): Promise<void> {
  await ensureSchema();
  await getPool().query("UPDATE teams SET passphrase_hash = $1 WHERE id = $2", [
    passphraseHash,
    teamId,
  ]);
}

export async function renameTeam(teamId: string, name: string): Promise<void> {
  await ensureSchema();
  await getPool().query("UPDATE teams SET name = $1 WHERE id = $2", [
    name,
    teamId,
  ]);
}

export async function deleteTeam(
  teamId: string
): Promise<{ ok: boolean; reason?: string }> {
  await ensureSchema();
  const { rows } = await getPool().query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM profiles WHERE team_id = $1",
    [teamId]
  );
  if (rows[0].count > 0) {
    return { ok: false, reason: "Move its profiles to another team first." };
  }
  await getPool().query("DELETE FROM teams WHERE id = $1", [teamId]);
  return { ok: true };
}

export async function moveProfileToTeam(
  name: string,
  teamId: string
): Promise<void> {
  await ensureSchema();
  await getPool().query("UPDATE profiles SET team_id = $1 WHERE name = $2", [
    teamId,
    name,
  ]);
}

// Shared cache for Google News wrapper -> real-URL resolution — see
// resolved_articles in ensureSchema. Read by /api/resolve-news-link before
// attempting a live resolve.
export async function getCachedResolution(
  sourceUrl: string
): Promise<string | null> {
  await ensureSchema();
  const { rows } = await getPool().query<{ resolved_url: string | null }>(
    "SELECT resolved_url FROM resolved_articles WHERE source_url = $1",
    [sourceUrl]
  );
  return rows[0]?.resolved_url ?? null;
}

export async function setCachedResolution(
  sourceUrl: string,
  resolvedUrl: string
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO resolved_articles (source_url, resolved_url)
     VALUES ($1, $2)
     ON CONFLICT (source_url)
     DO UPDATE SET resolved_url = EXCLUDED.resolved_url, resolved_at = now()`,
    [sourceUrl, resolvedUrl]
  );
}

export interface CachedArticleContent {
  title: string | null;
  byline: string | null;
  siteName: string | null;
  content: string;
}

// Shared cache for a fully fetched-and-extracted article — see
// resolved_articles in ensureSchema. Read by /api/article-content before
// attempting a live fetch/parse; keyed by whatever URL the client actually
// requested (already the resolved real URL for a Google News link whose
// save-time resolution succeeded, or the URL as saved otherwise).
export async function getCachedArticleContent(
  sourceUrl: string
): Promise<CachedArticleContent | null> {
  await ensureSchema();
  const { rows } = await getPool().query<{
    title: string | null;
    byline: string | null;
    site_name: string | null;
    content: string | null;
  }>(
    "SELECT title, byline, site_name, content FROM resolved_articles WHERE source_url = $1 AND content IS NOT NULL",
    [sourceUrl]
  );
  const row = rows[0];
  if (!row || row.content === null) return null;
  return { title: row.title, byline: row.byline, siteName: row.site_name, content: row.content };
}

export async function setCachedArticleContent(
  sourceUrl: string,
  data: CachedArticleContent
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO resolved_articles (source_url, title, byline, site_name, content)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (source_url)
     DO UPDATE SET
       title = EXCLUDED.title,
       byline = EXCLUDED.byline,
       site_name = EXCLUDED.site_name,
       content = EXCLUDED.content,
       resolved_at = now()`,
    [sourceUrl, data.title, data.byline, data.siteName, data.content]
  );
}
