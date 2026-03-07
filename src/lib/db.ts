import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

type AppDatabase = Database.Database;

declare global {
  var __promptifyDb: AppDatabase | undefined;
}

function resolveDatabasePath() {
  const configured = process.env.PROMPTIFY_DATABASE_PATH?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }

  return path.join(process.cwd(), "data", "promptify.sqlite");
}

function hasCompositePrimaryKey(db: AppDatabase, tableName: string) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string; pk: number }>;
  if (!rows.length) {
    return false;
  }

  return rows.some((row) => row.name === "user_id" && row.pk > 0);
}

function migratePromptStoreKeys(db: AppDatabase) {
  if (!hasCompositePrimaryKey(db, "saved_prompts")) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS saved_prompts_next (
        user_id TEXT NOT NULL,
        id TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'account',
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        is_starred INTEGER NOT NULL DEFAULT 0,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        folder TEXT,
        settings_json TEXT NOT NULL,
        output_json TEXT NOT NULL,
        PRIMARY KEY (user_id, id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      INSERT INTO saved_prompts_next (
        user_id,
        id,
        source,
        name,
        created_at,
        updated_at,
        tags_json,
        is_starred,
        is_favorite,
        folder,
        settings_json,
        output_json
      )
      SELECT
        user_id,
        id,
        source,
        name,
        created_at,
        updated_at,
        tags_json,
        is_starred,
        is_favorite,
        folder,
        settings_json,
        output_json
      FROM saved_prompts;

      DROP TABLE saved_prompts;
      ALTER TABLE saved_prompts_next RENAME TO saved_prompts;
      CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_id ON saved_prompts(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_prompts_updated_at ON saved_prompts(updated_at);
    `);
  }

  if (!hasCompositePrimaryKey(db, "history_entries")) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS history_entries_next (
        user_id TEXT NOT NULL,
        id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        settings_json TEXT NOT NULL,
        output_json TEXT NOT NULL,
        PRIMARY KEY (user_id, id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      INSERT INTO history_entries_next (
        user_id,
        id,
        created_at,
        settings_json,
        output_json
      )
      SELECT
        user_id,
        id,
        created_at,
        settings_json,
        output_json
      FROM history_entries;

      DROP TABLE history_entries;
      ALTER TABLE history_entries_next RENAME TO history_entries;
      CREATE INDEX IF NOT EXISTS idx_history_entries_user_id ON history_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_history_entries_created_at ON history_entries(created_at);
    `);
  }
}

function migrate(db: AppDatabase) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      plan_tier TEXT NOT NULL DEFAULT 'free',
      billing_status TEXT NOT NULL DEFAULT 'inactive',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      stripe_price_id TEXT,
      subscription_current_period_end TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS saved_prompts (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'account',
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      is_starred INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      folder TEXT,
      settings_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      PRIMARY KEY (user_id, id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_id ON saved_prompts(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_prompts_updated_at ON saved_prompts(updated_at);

    CREATE TABLE IF NOT EXISTS history_entries (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      settings_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      PRIMARY KEY (user_id, id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_history_entries_user_id ON history_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_entries_created_at ON history_entries(created_at);
  `);

  migratePromptStoreKeys(db);
}

export function getDatabase() {
  if (!global.__promptifyDb) {
    const databasePath = resolveDatabasePath();
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });

    const database = new Database(databasePath);
    migrate(database);
    global.__promptifyDb = database;
  }

  return global.__promptifyDb;
}
