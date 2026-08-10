import { E2E_HOSTNAME } from "./base-url";
import { executeLocalD1, toSqlText } from "./local-d1";

/**
 * ログイン状態の E2E で使うテストユーザー。
 *
 * 本物の Google OAuth は E2E から実行できないため、ローカル D1 に
 * users / sessions の行を直接作り、Auth.js のセッション Cookie を
 * ブラウザへ差し込むことでログイン済みの状態を再現する。
 */
export const TEST_USER = {
  id: "e2e-test-user",
  name: "E2Eユーザー",
  email: "e2e-test-user@example.com",
  /** `/{username}` としてルート直下に露出する。username.ts の形式・予約語を満たすこと。 */
  username: "e2e-user",
} as const;

/** sessions.sessionToken と Cookie の値。固定値で構わない（ローカル D1 限定）。 */
const TEST_SESSION_TOKEN = "e2e-session-token";

/**
 * Auth.js のセッション Cookie 名。
 * baseURL が http なので `__Secure-` プレフィックスは付かない。
 */
const SESSION_COOKIE_NAME = "authjs.session-token";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const AUTH_STORAGE_STATE_PATH = "tests/e2e/.auth/user.json";

/** テストユーザーに紐づく行をすべて消す SQL。 */
function buildCleanupStatements() {
  // comparison_memos は users への外部キーで ON DELETE CASCADE だが、
  // 依存関係を読み手に明示するため先に消す。
  return [
    `DELETE FROM comparison_memos WHERE user_id = ${toSqlText(TEST_USER.id)}`,
    `DELETE FROM sessions WHERE userId = ${toSqlText(TEST_USER.id)}`,
    `DELETE FROM accounts WHERE userId = ${toSqlText(TEST_USER.id)}`,
    `DELETE FROM users WHERE id = ${toSqlText(TEST_USER.id)}`,
  ];
}

/**
 * テストユーザーとセッションを作り直す。
 *
 * teardown が落ちた場合に備えて、ここでも既存行を消してから入れ直す。
 * 消さずに積み上げると保存件数上限（30 件）に当たって保存テストが 409 で落ちる。
 */
export function seedTestUser() {
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  executeLocalD1([
    ...buildCleanupStatements(),
    `INSERT INTO users (id, name, email, emailVerified, image, profile_initialized, username)
       VALUES (
         ${toSqlText(TEST_USER.id)},
         ${toSqlText(TEST_USER.name)},
         ${toSqlText(TEST_USER.email)},
         NULL,
         NULL,
         1,
         ${toSqlText(TEST_USER.username)}
       )`,
    `INSERT INTO sessions (id, sessionToken, userId, expires)
       VALUES (
         ${toSqlText(TEST_SESSION_TOKEN)},
         ${toSqlText(TEST_SESSION_TOKEN)},
         ${toSqlText(TEST_USER.id)},
         ${toSqlText(expires)}
       )`,
  ]);

  return { expires };
}

/**
 * テストユーザーの痕跡をローカル D1 から消す。
 *
 * 消さずに残すと、テストが作った公開メモが開発時のホーム一覧や sitemap.xml に
 * 現れ続け、未ログインの E2E が拾う「実データ」にもなってしまう。
 */
export function cleanupTestUser() {
  executeLocalD1(buildCleanupStatements());
}

export function buildSessionCookie(expiresIso: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: TEST_SESSION_TOKEN,
    domain: E2E_HOSTNAME,
    path: "/",
    expires: Math.floor(new Date(expiresIso).getTime() / 1000),
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
  };
}
