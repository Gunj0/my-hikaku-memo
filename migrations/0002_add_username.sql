-- URL ハンドル（username）の追加。
-- 表示名 users.name はユニーク制約が無く日本語・空白を許容するため URL には使えない。
-- URL セグメント専用の ASCII ハンドルを別カラムとして持つ。
--
-- NOT NULL は付けない。SQLite は既存行のあるテーブルに NOT NULL 列を
-- 既定値なしで追加できないため、必須性はアプリ層（ensureUserProfile）で担保する。

ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- 既存ユーザーへのバックフィル。
-- id（UUID）のハイフンを除いた先頭 8 文字を用いる。generateDefaultUsername と同じ規則。
UPDATE "users"
SET "username" = 'user-' || LOWER(SUBSTR(REPLACE("id", '-', ''), 1, 8))
WHERE "username" IS NULL;

-- 大文字小文字を区別しない一意制約。
-- 保存時にアプリ側でも小文字へ正規化するため二重の防御となる。
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
  ON "users" ("username" COLLATE NOCASE);
