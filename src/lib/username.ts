/**
 * URL ハンドル（username）の仕様。
 *
 * `/{username}` としてルート直下に露出するため、表示名（users.name）とは別物として扱う。
 * - percent-encoding を避けるため ASCII のみ許可する
 * - ルート直下の静的ルートおよび将来追加しうるパスを予約語として拒否する
 */

export const USERNAME_MIN_LENGTH = 5;
export const USERNAME_MAX_LENGTH = 15;

/** 英小文字・数字で始まり、途中に `-` / `_` を単独で挟め、英数字で終わる。 */
const USERNAME_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/**
 * ユーザー名として使えないパス。
 *
 * Next.js は静的セグメントを動的セグメントより優先するため既存ルートは壊れないが、
 * 後からルートを追加したときに既存ユーザーの URL を奪う事故を防ぐために予約する。
 */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  // 既存・予定のルート
  "api",
  "edit",
  "new",
  "settings",
  "memo",
  "memos",
  "terms",
  "privacy",
  "commercial-disclosure",
  "legal",
  // 一般的に予約しておくべき語
  "about",
  "account",
  "admin",
  "assets",
  "auth",
  "categories",
  "category",
  "contact",
  "css",
  "faq",
  "help",
  "home",
  "img",
  "images",
  "js",
  "login",
  "logout",
  "me",
  "profile",
  "public",
  "root",
  "search",
  "signin",
  "signout",
  "signup",
  "static",
  "support",
  "tag",
  "tags",
  "user",
  "users",
  // 静的ファイル・フレームワーク予約
  // `_next` や `.well-known` のように記号で始まるパスは形式バリデーションが先に弾くため、
  // ここには載せない（載せても到達不能な予約になる）。
  "favicon",
  "icon",
  "ogp",
  "robots",
  "sitemap",
  "well-known",
  // 値として紛らわしい語
  "false",
  "null",
  "true",
  "undefined",
]);

/** 入力を保存形式（trim + 小文字）へ正規化する。 */
export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export type UsernameValidationResult =
  | { ok: true; username: string }
  | { ok: false; message: string };

/**
 * 正規化したうえで仕様を満たすか検証する。
 * 成功時は保存すべき正規形を返す。
 */
export function validateUsername(value: string): UsernameValidationResult {
  const username = normalizeUsername(value);

  if (!username) {
    return { ok: false, message: "ユーザーIDを入力してください。" };
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      message: `ユーザーIDは${USERNAME_MIN_LENGTH}文字以上で入力してください。`,
    };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `ユーザーIDは${USERNAME_MAX_LENGTH}文字以内で入力してください。`,
    };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      message:
        "ユーザーIDは半角英数字と - _ のみ使えます。先頭と末尾は英数字にしてください。",
    };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { ok: false, message: "このユーザーIDは使用できません。" };
  }

  return { ok: true, username };
}

/**
 * 初回ログイン時に自動採番する既定のユーザーID。
 * migration 0002 のバックフィルと同じ規則で、id のハイフンを除いた先頭 8 文字を用いる。
 */
export function generateDefaultUsername(userId: string): string {
  const suffix = userId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toLowerCase();

  return `user-${suffix || "00000000"}`;
}

/**
 * 採番した既定値が衝突したときの代替候補。
 * `user-abcd1234` に対して `user-abcd1234-2` のように連番を付ける。
 * 上限を超える場合は末尾を切り詰めて長さを守る。
 */
export function buildUsernameCandidate(base: string, attempt: number): string {
  if (attempt <= 1) {
    return base;
  }

  const suffix = `-${attempt}`;
  const head = base.slice(0, USERNAME_MAX_LENGTH - suffix.length);

  return `${head.replace(/[-_]+$/, "")}${suffix}`;
}
