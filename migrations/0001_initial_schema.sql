-- ベースラインスキーマ。
-- 旧実装ではランタイム（src/lib/server/database.ts の ensureDatabaseSetup）が
-- 同内容の DDL を初回アクセス時に実行していた。既存 DB には全テーブル・カラムが
-- 存在するため、全文 IF NOT EXISTS で冪等にしてある（既存 DB では no-op）。

-- Auth.js (@auth/d1-adapter) 標準テーブル
CREATE TABLE IF NOT EXISTS "accounts" (
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
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" text NOT NULL,
  "sessionToken" text NOT NULL,
  "userId" text NOT NULL DEFAULT NULL,
  "expires" datetime NOT NULL DEFAULT NULL,
  PRIMARY KEY (sessionToken)
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" text NOT NULL DEFAULT '',
  "name" text DEFAULT NULL,
  "email" text DEFAULT NULL,
  "emailVerified" datetime DEFAULT NULL,
  "image" text DEFAULT NULL,
  "profile_initialized" integer NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL DEFAULT NULL,
  "expires" datetime NOT NULL DEFAULT NULL,
  PRIMARY KEY (token)
);

-- 比較メモ
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
);

CREATE INDEX IF NOT EXISTS idx_comparison_memos_user_updated
  ON comparison_memos(user_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_comparison_memos_public_id
  ON comparison_memos(public_id);
