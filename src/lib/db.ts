import postgres from 'postgres';
import { TrackerState } from '@/types/tracker';

const getDatabaseUrl = (): string | undefined => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL
  );
};

// Singleton connection instance for Next.js server runtime
let sqlInstance: ReturnType<typeof postgres> | null = null;

export function getDbClient() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return null;
  }

  if (!sqlInstance) {
    // If Supabase pooler or direct connection requires SSL:
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    sqlInstance = postgres(connectionString, {
      ssl: isLocalhost ? false : 'require',
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sqlInstance;
}

export function isDatabaseConfigured(): boolean {
  return !!getDatabaseUrl();
}

/**
 * Initializes the devops_tracker table in Supabase PostgreSQL if it does not exist yet.
 */
export async function initDbSchema(): Promise<{ success: boolean; message: string }> {
  const sql = getDbClient();
  if (!sql) {
    return {
      success: false,
      message: 'No DATABASE_URL configured in environment variables.',
    };
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS devops_tracker (
        id VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Create an index on updated_at for fast sort/retrieval
    await sql`
      CREATE INDEX IF NOT EXISTS idx_devops_tracker_updated_at ON devops_tracker(updated_at DESC);
    `;

    return {
      success: true,
      message: 'Table "devops_tracker" initialized successfully.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error initializing Supabase database schema:', errorMsg);
    return {
      success: false,
      message: `Failed to initialize database: ${errorMsg}`,
    };
  }
}

/**
 * Checks connection health to Supabase PostgreSQL.
 */
export async function testDbConnection(): Promise<{ success: boolean; message: string; timestamp?: string }> {
  const sql = getDbClient();
  if (!sql) {
    return {
      success: false,
      message: 'No DATABASE_URL configured. Add your Supabase connection string to .env.local to enable cloud sync.',
    };
  }

  try {
    const [result] = await sql`SELECT NOW() as db_time, current_database() as db_name, version() as pg_version;`;
    return {
      success: true,
      message: `Successfully connected to Supabase database "${result.db_name}".`,
      timestamp: result.db_time?.toString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Database connection test failed:', errorMsg);
    return {
      success: false,
      message: `Connection error: ${errorMsg}`,
    };
  }
}

/**
 * Fetches the current tracker data from the database.
 */
export async function getTrackerDataFromDb(userId: string = 'default'): Promise<TrackerState | null> {
  const sql = getDbClient();
  if (!sql) return null;

  try {
    // Ensure table exists
    await initDbSchema();

    const rows = await sql`
      SELECT data, updated_at FROM devops_tracker WHERE id = ${userId} LIMIT 1;
    `;

    if (rows.length === 0) {
      return null;
    }

    return rows[0].data as TrackerState;
  } catch (err) {
    console.error('Error reading tracker data from database:', err);
    return null;
  }
}

/**
 * Saves tracker data to Supabase PostgreSQL.
 */
export async function saveTrackerDataToDb(data: TrackerState, userId: string = 'default'): Promise<boolean> {
  const sql = getDbClient();
  if (!sql) return false;

  try {
    await initDbSchema();

    await sql`
      INSERT INTO devops_tracker (id, data, updated_at)
      VALUES (${userId}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW();
    `;

    return true;
  } catch (err) {
    console.error('Error saving tracker data to database:', err);
    return false;
  }
}
