-- public_id の採番を SQLite の AUTOINCREMENT に委ねる。
--
-- 旧実装はアプリ側で `(SELECT COALESCE(MAX(public_id), 0) + 1 FROM comparison_memos)`
-- を評価して採番していた。同時 INSERT が同じ MAX を読むと双方が同じ値を書こうとし、
-- idx_comparison_memos_public_id（UNIQUE）違反で後着の保存が失敗する。
--
-- public_id を INTEGER PRIMARY KEY AUTOINCREMENT にすると採番が rowid 採番と同一になり、
-- SQLite が原子的に単調増加を保証する。UNIQUE インデックスも主キー制約に吸収されるため不要になる。
--
-- SQLite は既存列の主キー化を ALTER TABLE で行えないため、テーブルを作り直して移送する。
-- comparison_memos を参照する外部キーは存在しないため、DROP と RENAME は安全である。
--
-- AUTOINCREMENT は最後に採番した値を sqlite_sequence に保持する。既存行を明示的な
-- public_id 付きで INSERT すると sqlite_sequence が最大値へ更新されるため、
-- 移送後の新規メモは既存の続きから採番される（既存 URL と衝突しない）。

CREATE TABLE comparison_memos_new (
  public_id INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  data TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- public_id = 0 の行は旧既定値の残骸であり、UNIQUE 制約下では 1 行しか存在しえない。
-- 主キーには 0 も格納できるため、そのまま移送して既存 URL を保つ。
INSERT INTO comparison_memos_new
  (public_id, id, user_id, title, category, data, is_public, created_at, updated_at)
SELECT public_id, id, user_id, title, category, data, is_public, created_at, updated_at
FROM comparison_memos;

DROP TABLE comparison_memos;

ALTER TABLE comparison_memos_new RENAME TO comparison_memos;

-- 一覧クエリ（WHERE user_id = ? ORDER BY updated_at DESC）用。作り直しで失われるため再作成する。
CREATE INDEX IF NOT EXISTS idx_comparison_memos_user_updated
  ON comparison_memos(user_id, updated_at DESC);

-- 公開一覧・sitemap 用（WHERE is_public = 1 ORDER BY updated_at DESC）。
CREATE INDEX IF NOT EXISTS idx_comparison_memos_public_updated
  ON comparison_memos(is_public, updated_at DESC);

-- idx_comparison_memos_public_id は public_id が主キーになったため再作成しない。
