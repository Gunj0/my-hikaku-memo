import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  comparisonDataSchema,
  comparisonMemoPayloadSchema,
  type ComparisonMemoPayload,
} from "@/lib/comparison-schemas";
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
  public_id: number;
  created_at: number;
  updated_at: number;
};

type ComparisonMemoSummaryRow = Omit<ComparisonMemoRow, "data">;

type PublicComparisonMemoSummaryRow = ComparisonMemoSummaryRow & {
  user_name: string | null;
  user_profile_initialized: number | null;
};

type PublicComparisonMemoRow = ComparisonMemoRow & {
  user_name: string | null;
  user_profile_initialized: number | null;
};

type PublicComparisonMemoSitemapRow = {
  public_id: number;
  updated_at: number;
};

function getDatabase() {
  const { env } = getCloudflareContext();

  return (env as CloudflareEnv & { DB: D1Database }).DB;
}

function toIsoString(timestamp: number) {
  return new Date(timestamp).toISOString();
}

function mapAuthor(
  row: Pick<
    PublicComparisonMemoSummaryRow,
    "user_id" | "user_name" | "user_profile_initialized"
  >,
): ComparisonMemoAuthor {
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

function mapSummary(row: ComparisonMemoSummaryRow): ComparisonMemoSummary {
  return {
    id: String(row.public_id),
    title: row.title,
    category: row.category,
    isPublic: Boolean(row.is_public),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapMemo(row: ComparisonMemoRow): ComparisonMemo | null {
  try {
    return {
      ...mapSummary(row),
      data: comparisonDataSchema.parse(JSON.parse(row.data)),
    };
  } catch {
    return null;
  }
}

function mapPublicSummary(
  row: PublicComparisonMemoSummaryRow,
): PublicComparisonMemoSummary {
  return {
    ...mapSummary(row),
    author: mapAuthor(row),
  };
}

function mapPublicMemo(
  row: PublicComparisonMemoRow,
  viewerUserId?: string,
): PublicComparisonMemo | null {
  const memo = mapMemo(row);

  if (!memo) {
    return null;
  }

  return {
    ...memo,
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
  const database = getDatabase();
  const result = await database
    .prepare(
      `
        SELECT id, user_id, title, category, data, is_public, public_id, created_at, updated_at
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
  const publicId = parseInt(memoId, 10);

  if (!Number.isInteger(publicId) || publicId <= 0) {
    return null;
  }

  const database = getDatabase();
  const row = await database
    .prepare(
      `
        SELECT id, user_id, title, category, data, is_public, public_id, created_at, updated_at
        FROM comparison_memos
        WHERE public_id = ?1 AND user_id = ?2
        LIMIT 1
      `,
    )
    .bind(publicId, userId)
    .first<ComparisonMemoRow>();

  return row ? (mapMemo(row) ?? null) : null;
}

export async function listRandomComparisonMemos(
  limit: number,
  excludeUserId?: string,
) {
  const database = getDatabase();
  const result = await database
    .prepare(
      `
        SELECT m.id, m.user_id, m.title, m.category, m.is_public, m.public_id, m.created_at, m.updated_at,
           u.name AS user_name, u.profile_initialized AS user_profile_initialized
        FROM comparison_memos AS m
        LEFT JOIN users AS u ON u.id = m.user_id
        WHERE m.is_public = 1 AND (?1 IS NULL OR m.user_id != ?1)
        ORDER BY RANDOM()
        LIMIT ?2
      `,
    )
    .bind(excludeUserId ?? null, limit)
    .all<PublicComparisonMemoSummaryRow>();

  return result.results.map(mapPublicSummary);
}

export async function listPublicComparisonMemos(limit?: number) {
  const database = getDatabase();
  const query =
    typeof limit === "number"
      ? database
          .prepare(
            `
              SELECT m.id, m.user_id, m.title, m.category, m.is_public, m.public_id, m.created_at, m.updated_at,
                 u.name AS user_name, u.profile_initialized AS user_profile_initialized
              FROM comparison_memos AS m
              LEFT JOIN users AS u ON u.id = m.user_id
              WHERE m.is_public = 1
              ORDER BY m.updated_at DESC
              LIMIT ?1
            `,
          )
          .bind(limit)
      : database.prepare(
          `
            SELECT m.id, m.user_id, m.title, m.category, m.is_public, m.public_id, m.created_at, m.updated_at,
               u.name AS user_name, u.profile_initialized AS user_profile_initialized
            FROM comparison_memos AS m
            LEFT JOIN users AS u ON u.id = m.user_id
            WHERE m.is_public = 1
            ORDER BY m.updated_at DESC
          `,
        );

  const result = await query.all<PublicComparisonMemoSummaryRow>();

  return result.results.map(mapPublicSummary);
}

export async function listPublicComparisonMemoSitemapEntries() {
  const database = getDatabase();
  const result = await database
    .prepare(
      `
        SELECT public_id, updated_at
        FROM comparison_memos
        WHERE is_public = 1
        ORDER BY updated_at DESC
      `,
    )
    .all<PublicComparisonMemoSitemapRow>();

  return result.results.map((row) => ({
    id: String(row.public_id),
    updatedAt: toIsoString(row.updated_at),
  }));
}

export async function getPublicComparisonMemo(
  memoId: string,
  viewerUserId?: string,
) {
  const publicId = parseInt(memoId, 10);

  if (!Number.isInteger(publicId) || publicId <= 0) {
    return null;
  }

  const database = getDatabase();
  const row = await database
    .prepare(
      `
        SELECT m.id, m.user_id, m.title, m.category, m.data, m.is_public, m.public_id, m.created_at, m.updated_at,
           u.name AS user_name, u.profile_initialized AS user_profile_initialized
        FROM comparison_memos AS m
        LEFT JOIN users AS u ON u.id = m.user_id
        WHERE m.public_id = ?1
          AND (m.is_public = 1 OR (?2 IS NOT NULL AND m.user_id = ?2))
        LIMIT 1
      `,
    )
    .bind(publicId, viewerUserId ?? null)
    .first<PublicComparisonMemoRow>();

  return row ? (mapPublicMemo(row, viewerUserId) ?? null) : null;
}

export async function createComparisonMemo(
  userId: string,
  payload: ComparisonMemoPayload,
) {
  await ensureUserProfile(userId);

  const database = getDatabase();
  const normalized = normalizePayload(payload);
  const now = Date.now();
  const memoId = crypto.randomUUID();

  await database
    .prepare(
      `
        INSERT INTO comparison_memos (id, user_id, title, category, data, is_public, public_id, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, (SELECT COALESCE(MAX(public_id), 0) + 1 FROM comparison_memos), ?7, ?8)
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

  const row = await database
    .prepare(
      `SELECT public_id FROM comparison_memos WHERE id = ?1 LIMIT 1`,
    )
    .bind(memoId)
    .first<{ public_id: number }>();

  if (!row) {
    return null;
  }

  return getComparisonMemo(userId, String(row.public_id));
}

export async function updateComparisonMemo(
  userId: string,
  memoId: string,
  payload: ComparisonMemoPayload,
) {
  const publicId = parseInt(memoId, 10);

  if (!Number.isInteger(publicId) || publicId <= 0) {
    return null;
  }

  const database = getDatabase();
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
        WHERE public_id = ?1 AND user_id = ?2
      `,
    )
    .bind(
      publicId,
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
  const publicId = parseInt(memoId, 10);

  if (!Number.isInteger(publicId) || publicId <= 0) {
    return false;
  }

  const database = getDatabase();
  const result = await database
    .prepare(
      `
        DELETE FROM comparison_memos
        WHERE public_id = ?1 AND user_id = ?2
      `,
    )
    .bind(publicId, userId)
    .run();

  return Boolean(result.meta.changed_db);
}
