import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  buildUsernameCandidate,
  generateDefaultUsername,
  normalizeUsername,
} from "@/lib/username";

type UserProfileRow = {
  id: string;
  name: string | null;
  username: string | null;
  profile_initialized: number | null;
};

export type UserProfile = {
  id: string;
  /** 表示名。日本語・空白を含みうる。URL には使わない。 */
  name: string;
  /** URL ハンドル。`/{username}` として露出する。 */
  username: string;
  image: string;
};

/** username の自動採番でユニーク制約に当たったときの再試行回数。 */
const USERNAME_ASSIGN_MAX_ATTEMPTS = 5;

/** username がすでに使われている場合に updateUsernameRecord が返す識別子。 */
export const USERNAME_TAKEN = "username-taken" as const;

export const USER_PROFILE_NAME_MAX_LENGTH = 12;

const AVATAR_PALETTES = [
  { start: "#0f766e", end: "#0f766e", accent: "#0f766e" },
  { start: "#1d4ed8", end: "#1d4ed8", accent: "#1d4ed8" },
  { start: "#b45309", end: "#b45309", accent: "#b45309" },
  { start: "#be123c", end: "#be123c", accent: "#be123c" },
  { start: "#166534", end: "#166534", accent: "#166534" },
];

function hashString(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getAvatarSvg(userId: string) {
  const palette = AVATAR_PALETTES[hashString(userId) % AVATAR_PALETTES.length];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="User avatar">
      <defs>
        <linearGradient id="avatar-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="100%" stop-color="${palette.end}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#avatar-gradient)" />
      <circle cx="32" cy="24" r="11" fill="rgba(255,255,255,0.92)" />
      <path d="M14 54c2.5-10 10.2-16 18-16s15.5 6 18 16" fill="rgba(255,255,255,0.92)" />
    </svg>
  `.trim();
}

function getDatabase() {
  const { env } = getCloudflareContext();

  return (env as CloudflareEnv & { DB: D1Database }).DB;
}

export function getDefaultUserName(userId: string) {
  const suffix = userId.replace(/-/g, "").slice(0, 6).toUpperCase();

  return `ユーザー${suffix}`;
}

export function normalizeUserProfileName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function getUserAvatarDataUri(userId: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(getAvatarSvg(userId))}`;
}

function resolveUserName(row: UserProfileRow) {
  const normalizedName = row.name ? normalizeUserProfileName(row.name) : "";

  if (row.profile_initialized === 1 && normalizedName) {
    return normalizedName;
  }

  return getDefaultUserName(row.id);
}

function resolveUsername(row: UserProfileRow) {
  const normalized = row.username ? normalizeUsername(row.username) : "";

  // 未採番の行でも呼び出し側が username を扱えるよう、既定値を返す。
  // 永続化は ensureUserProfileRecord が担う。
  return normalized || generateDefaultUsername(row.id);
}

function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: resolveUserName(row),
    username: resolveUsername(row),
    image: getUserAvatarDataUri(row.id),
  };
}

async function getUserProfileRow(database: D1Database, userId: string) {
  return database
    .prepare(
      `
        SELECT id, name, username, profile_initialized
        FROM users
        WHERE id = ?1
        LIMIT 1
      `,
    )
    .bind(userId)
    .first<UserProfileRow>();
}

/**
 * username を他ユーザーに取られていない場合に限り更新する。
 * ユニーク制約違反を例外メッセージで判定せずに済むよう、条件付き UPDATE で表現する。
 */
async function tryClaimUsername(
  database: D1Database,
  userId: string,
  username: string,
) {
  const result = await database
    .prepare(
      `
        UPDATE users
        SET username = ?2
        WHERE id = ?1
          AND NOT EXISTS (
            SELECT 1 FROM users WHERE username = ?2 COLLATE NOCASE AND id != ?1
          )
      `,
    )
    .bind(userId, username)
    .run();

  return Boolean(result.meta.changed_db);
}

/** username が未設定の行に既定値を採番する。衝突時は連番を付けて再試行する。 */
async function assignDefaultUsername(database: D1Database, userId: string) {
  const base = generateDefaultUsername(userId);

  for (let attempt = 1; attempt <= USERNAME_ASSIGN_MAX_ATTEMPTS; attempt += 1) {
    const candidate = buildUsernameCandidate(base, attempt);

    if (await tryClaimUsername(database, userId, candidate)) {
      return candidate;
    }
  }

  // 連番が尽きた場合の最終手段。乱数で衝突確率を潰す。
  const fallback = buildUsernameCandidate(
    base,
    Math.floor(Math.random() * 900000) + 100000,
  );

  return (await tryClaimUsername(database, userId, fallback))
    ? fallback
    : null;
}

export async function getUserProfileRecord(
  database: D1Database,
  userId: string,
) {
  const row = await getUserProfileRow(database, userId);

  return row ? mapUserProfile(row) : null;
}

export async function ensureUserProfileRecord(
  database: D1Database,
  userId: string,
) {
  const row = await getUserProfileRow(database, userId);

  if (!row) {
    return null;
  }

  const profile = mapUserProfile(row);

  if (row.profile_initialized !== 1 || row.name !== profile.name) {
    await database
      .prepare(
        `
          UPDATE users
          SET name = ?2,
              image = NULL,
              profile_initialized = 1
          WHERE id = ?1
        `,
      )
      .bind(userId, profile.name)
      .run();
  }

  if (row.username) {
    return profile;
  }

  // username は URL の一部になるため、未採番のまま返してはならない。
  const assigned = await assignDefaultUsername(database, userId);

  if (!assigned) {
    return null;
  }

  return { ...profile, username: assigned };
}

export async function getUserProfileByUsernameRecord(
  database: D1Database,
  username: string,
) {
  const normalized = normalizeUsername(username);

  if (!normalized) {
    return null;
  }

  const row = await database
    .prepare(
      `
        SELECT id, name, username, profile_initialized
        FROM users
        WHERE username = ?1 COLLATE NOCASE
        LIMIT 1
      `,
    )
    .bind(normalized)
    .first<UserProfileRow>();

  return row ? mapUserProfile(row) : null;
}

/**
 * username を更新する。
 * 他ユーザーが使用中の場合は USERNAME_TAKEN を返し、呼び出し側が 409 へ変換する。
 * 呼び出し前に validateUsername を通し、正規形を渡すこと。
 */
export async function updateUsernameRecord(
  database: D1Database,
  userId: string,
  username: string,
) {
  const claimed = await tryClaimUsername(database, userId, username);

  if (!claimed) {
    return USERNAME_TAKEN;
  }

  return getUserProfileRecord(database, userId);
}

export async function updateUserProfileNameRecord(
  database: D1Database,
  userId: string,
  name: string,
) {
  const normalizedName = normalizeUserProfileName(name);

  await database
    .prepare(
      `
        UPDATE users
        SET name = ?2,
            image = NULL,
            profile_initialized = 1
        WHERE id = ?1
      `,
    )
    .bind(userId, normalizedName)
    .run();

  return getUserProfileRecord(database, userId);
}

export async function getUserProfile(userId: string) {
  const database = getDatabase();

  return getUserProfileRecord(database, userId);
}

export async function ensureUserProfile(userId: string) {
  const database = getDatabase();

  return ensureUserProfileRecord(database, userId);
}

export async function updateUserProfileName(userId: string, name: string) {
  const database = getDatabase();

  return updateUserProfileNameRecord(database, userId, name);
}

export async function getUserProfileByUsername(username: string) {
  const database = getDatabase();

  return getUserProfileByUsernameRecord(database, username);
}

export async function updateUsername(userId: string, username: string) {
  const database = getDatabase();

  return updateUsernameRecord(database, userId, username);
}
