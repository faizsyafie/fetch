import { Pool } from "pg";

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
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

export async function listProfileNames(): Promise<string[]> {
  await ensureSchema();
  const result = await getPool().query<{ name: string }>(
    "SELECT name FROM profiles ORDER BY name ASC"
  );
  return result.rows.map((row) => row.name);
}

export async function getProfilePreferences(
  name: string
): Promise<unknown | null> {
  await ensureSchema();
  const result = await getPool().query<{ preferences: unknown }>(
    "SELECT preferences FROM profiles WHERE name = $1",
    [name]
  );
  return result.rows[0]?.preferences ?? null;
}

export async function saveProfilePreferences(
  name: string,
  preferences: unknown
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO profiles (name, preferences, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (name)
     DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = now()`,
    [name, preferences]
  );
}
