const authTableStatements = [
  `CREATE TABLE IF NOT EXISTS "accounts" (
    "id" text NOT NULL,
    "userId" text NOT NULL DEFAULT NULL,
    "type" text NOT NULL DEFAULT NULL,
    "provider" text NOT NULL DEFAULT NULL,
    "providerAccountId" text NOT NULL DEFAULT NULL,
    "refresh_token" text DEFAULT NULL,
    "access_token" text DEFAULT NULL,
    "expires_at" number DEFAULT NULL,
    "token_type" text DEFAULT NULL,
    "scope" text DEFAULT NULL,
    "id_token" text DEFAULT NULL,
    "session_state" text DEFAULT NULL,
    "oauth_token_secret" text DEFAULT NULL,
    "oauth_token" text DEFAULT NULL,
    PRIMARY KEY (id)
  )`,
  `CREATE TABLE IF NOT EXISTS "sessions" (
    "id" text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL DEFAULT NULL,
    "expires" datetime NOT NULL DEFAULT NULL,
    PRIMARY KEY (sessionToken)
  )`,
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" text NOT NULL DEFAULT '',
    "name" text DEFAULT NULL,
    "email" text DEFAULT NULL,
    "emailVerified" datetime DEFAULT NULL,
    "image" text DEFAULT NULL,
    "profile_initialized" integer NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
  )`,
  `CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" text NOT NULL,
    "token" text NOT NULL DEFAULT NULL,
    "expires" datetime NOT NULL DEFAULT NULL,
    PRIMARY KEY (token)
  )`,
];

const memoTableStatements = [
  `
    CREATE TABLE IF NOT EXISTS comparison_memos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      data TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      public_id INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_comparison_memos_user_updated
    ON comparison_memos(user_id, updated_at DESC)
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_comparison_memos_public_id
    ON comparison_memos(public_id)
  `,
];

type TableInfoRow = {
  name: string;
};

async function ensureMemoVisibilityColumn(database: D1Database) {
  const columns = await database
    .prepare('PRAGMA table_info("comparison_memos")')
    .all<TableInfoRow>();

  if (!columns.results.some((column) => column.name === "is_public")) {
    await database
      .prepare(
        `ALTER TABLE comparison_memos ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0`,
      )
      .run();
  }
}

async function ensureMemoPublicId(database: D1Database) {
  const columns = await database
    .prepare('PRAGMA table_info("comparison_memos")')
    .all<TableInfoRow>();

  if (!columns.results.some((column) => column.name === "public_id")) {
    await database
      .prepare(
        `ALTER TABLE comparison_memos ADD COLUMN public_id INTEGER NOT NULL DEFAULT 0`,
      )
      .run();
    await database
      .prepare(
        `UPDATE comparison_memos SET public_id = rowid WHERE public_id = 0`,
      )
      .run();
    await database
      .prepare(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_comparison_memos_public_id ON comparison_memos(public_id)`,
      )
      .run();
  }
}

async function ensureUserProfileInitializedColumn(database: D1Database) {
  const columns = await database
    .prepare('PRAGMA table_info("users")')
    .all<TableInfoRow>();

  if (
    !columns.results.some((column) => column.name === "profile_initialized")
  ) {
    await database
      .prepare(
        `ALTER TABLE users ADD COLUMN profile_initialized INTEGER NOT NULL DEFAULT 0`,
      )
      .run();
  }
}

let setupPromise: Promise<void> | null = null;

export function ensureDatabaseSetup(database: D1Database) {
  if (!setupPromise) {
    setupPromise = (async () => {
      for (const statement of authTableStatements) {
        await database.prepare(statement).run();
      }

      for (const statement of memoTableStatements) {
        await database.prepare(statement).run();
      }

      await ensureMemoVisibilityColumn(database);
      await ensureMemoPublicId(database);
      await ensureUserProfileInitializedColumn(database);
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  return setupPromise;
}
