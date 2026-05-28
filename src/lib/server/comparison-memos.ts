import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  comparisonDataSchema,
  comparisonMemoPayloadSchema,
  type ComparisonMemoPayload,
} from "@/lib/comparison-schemas";
import { ensureDatabaseSetup } from "@/lib/server/database";
import {
  ensureUserProfile,
  getDefaultUserName,
  getUserAvatarDataUri,
} from "@/lib/server/user-profiles";
import type {
  ComparisonMemo,
  ComparisonMemoAuthor,
  ComparisonMemoSummary,
  PublicComparisonMemo,
  PublicComparisonMemoSummary,
} from "@/lib/types";

type ComparisonMemoRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  data: string;
  is_public: number;
  created_at: number;
  updated_at: number;
};

type PublicComparisonMemoRow = ComparisonMemoRow & {
  user_name: string | null;
  user_profile_initialized: number | null;
};

async function getDatabase() {
  const { env } = getCloudflareContext();
  const database = (env as CloudflareEnv & { DB: D1Database }).DB;

  await ensureDatabaseSetup(database);

  return database;
}

function toIsoString(timestamp: number) {
  return new Date(timestamp).toISOString();
}

function mapAuthor(row: PublicComparisonMemoRow): ComparisonMemoAuthor {
  const normalizedName = row.user_name?.trim();

  return {
    id: row.user_id,
    name:
      row.user_profile_initialized === 1 && normalizedName
        ? normalizedName
        : getDefaultUserName(row.user_id),
    image: getUserAvatarDataUri(row.user_id),
  };
}

function mapSummary(row: ComparisonMemoRow): ComparisonMemoSummary {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    isPublic: Boolean(row.is_public),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapMemo(row: ComparisonMemoRow): ComparisonMemo {
  return {
    ...mapSummary(row),
    data: comparisonDataSchema.parse(JSON.parse(row.data)),
  };
}

function mapPublicSummary(
  row: PublicComparisonMemoRow,
): PublicComparisonMemoSummary {
  return {
    ...mapSummary(row),
    author: mapAuthor(row),
  };
}

function mapPublicMemo(
  row: PublicComparisonMemoRow,
  viewerUserId?: string,
): PublicComparisonMemo {
  return {
    ...mapMemo(row),
    author: mapAuthor(row),
    isOwner: row.user_id === viewerUserId,
  };
}

function normalizePayload(payload: ComparisonMemoPayload) {
  const parsed = comparisonMemoPayloadSchema.parse(payload);

  return {
    title: parsed.title.trim(),
    category: parsed.data.category.trim(),
    data: parsed.data,
    isPublic: parsed.isPublic,
  };
}

export async function listComparisonMemos(userId: string) {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `
        SELECT id, user_id, title, category, data, is_public, created_at, updated_at
        FROM comparison_memos
        WHERE user_id = ?1
        ORDER BY updated_at DESC
      `,
    )
    .bind(userId)
    .all<ComparisonMemoRow>();

  return result.results.map(mapSummary);
}

export async function getComparisonMemo(userId: string, memoId: string) {
  const database = await getDatabase();
  const row = await database
    .prepare(
      `
        SELECT id, user_id, title, category, data, is_public, created_at, updated_at
        FROM comparison_memos
        WHERE id = ?1 AND user_id = ?2
        LIMIT 1
      `,
    )
    .bind(memoId, userId)
    .first<ComparisonMemoRow>();

  return row ? mapMemo(row) : null;
}

export async function listRandomComparisonMemos(
  limit: number,
  excludeUserId?: string,
) {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `
        SELECT m.id, m.user_id, m.title, m.category, m.data, m.is_public, m.created_at, m.updated_at,
           u.name AS user_name, u.profile_initialized AS user_profile_initialized
        FROM comparison_memos AS m
        LEFT JOIN users AS u ON u.id = m.user_id
        WHERE m.is_public = 1 AND (?1 IS NULL OR m.user_id != ?1)
        ORDER BY RANDOM()
        LIMIT ?2
      `,
    )
    .bind(excludeUserId ?? null, limit)
    .all<PublicComparisonMemoRow>();

  return result.results.map(mapPublicSummary);
}

export async function getPublicComparisonMemo(
  memoId: string,
  viewerUserId?: string,
) {
  const database = await getDatabase();
  const row = await database
    .prepare(
      `
        SELECT m.id, m.user_id, m.title, m.category, m.data, m.is_public, m.created_at, m.updated_at,
           u.name AS user_name, u.profile_initialized AS user_profile_initialized
        FROM comparison_memos AS m
        LEFT JOIN users AS u ON u.id = m.user_id
        WHERE m.id = ?1
          AND (m.is_public = 1 OR (?2 IS NOT NULL AND m.user_id = ?2))
        LIMIT 1
      `,
    )
    .bind(memoId, viewerUserId ?? null)
    .first<PublicComparisonMemoRow>();

  return row ? mapPublicMemo(row, viewerUserId) : null;
}

export async function createComparisonMemo(
  userId: string,
  payload: ComparisonMemoPayload,
) {
  await ensureUserProfile(userId);

  const database = await getDatabase();
  const normalized = normalizePayload(payload);
  const now = Date.now();
  const memoId = crypto.randomUUID();

  await database
    .prepare(
      `
        INSERT INTO comparison_memos (id, user_id, title, category, data, is_public, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
      `,
    )
    .bind(
      memoId,
      userId,
      normalized.title,
      normalized.category,
      JSON.stringify(normalized.data),
      normalized.isPublic ? 1 : 0,
      now,
      now,
    )
    .run();

  return getComparisonMemo(userId, memoId);
}

export async function updateComparisonMemo(
  userId: string,
  memoId: string,
  payload: ComparisonMemoPayload,
) {
  const database = await getDatabase();
  const normalized = normalizePayload(payload);
  const now = Date.now();

  const result = await database
    .prepare(
      `
        UPDATE comparison_memos
        SET title = ?3,
            category = ?4,
            data = ?5,
            is_public = ?6,
            updated_at = ?7
        WHERE id = ?1 AND user_id = ?2
      `,
    )
    .bind(
      memoId,
      userId,
      normalized.title,
      normalized.category,
      JSON.stringify(normalized.data),
      normalized.isPublic ? 1 : 0,
      now,
    )
    .run();

  if (!result.meta.changed_db) {
    return null;
  }

  return getComparisonMemo(userId, memoId);
}

export async function deleteComparisonMemo(userId: string, memoId: string) {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `
        DELETE FROM comparison_memos
        WHERE id = ?1 AND user_id = ?2
      `,
    )
    .bind(memoId, userId)
    .run();

  return Boolean(result.meta.changed_db);
}
