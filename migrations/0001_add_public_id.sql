ALTER TABLE comparison_memos ADD COLUMN public_id INTEGER NOT NULL DEFAULT 0;
UPDATE comparison_memos SET public_id = rowid WHERE public_id = 0;
CREATE UNIQUE INDEX idx_comparison_memos_public_id ON comparison_memos(public_id);
