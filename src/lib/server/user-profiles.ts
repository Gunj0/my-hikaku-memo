import { getCloudflareContext } from "@opennextjs/cloudflare";

import { ensureDatabaseSetup } from "@/lib/server/database";

type UserProfileRow = {
  id: string;
  name: string | null;
  profile_initialized: number | null;
};

export type UserProfile = {
  id: string;
  name: string;
  image: string;
};

export const USER_PROFILE_NAME_MAX_LENGTH = 12;

const AVATAR_PALETTES = [
  { start: "#0f766e", end: "#0f172a", accent: "#99f6e4" },
  { start: "#1d4ed8", end: "#1e293b", accent: "#bfdbfe" },
  { start: "#b45309", end: "#292524", accent: "#fde68a" },
  { start: "#be123c", end: "#312e81", accent: "#fecdd3" },
  { start: "#166534", end: "#14532d", accent: "#bbf7d0" },
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

async function getDatabase() {
  const { env } = getCloudflareContext();
  const database = (env as CloudflareEnv & { DB: D1Database }).DB;

  await ensureDatabaseSetup(database);

  return database;
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

function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: resolveUserName(row),
    image: getUserAvatarDataUri(row.id),
  };
}

async function getUserProfileRow(database: D1Database, userId: string) {
  return database
    .prepare(
      `
        SELECT id, name, profile_initialized
        FROM users
        WHERE id = ?1
        LIMIT 1
      `,
    )
    .bind(userId)
    .first<UserProfileRow>();
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

  return profile;
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
  const database = await getDatabase();

  return getUserProfileRecord(database, userId);
}

export async function ensureUserProfile(userId: string) {
  const database = await getDatabase();

  return ensureUserProfileRecord(database, userId);
}

export async function updateUserProfileName(userId: string, name: string) {
  const database = await getDatabase();

  return updateUserProfileNameRecord(database, userId, name);
}
