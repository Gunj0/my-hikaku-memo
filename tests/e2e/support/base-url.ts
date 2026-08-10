/**
 * E2E のベース URL。
 *
 * playwright.config.ts（use.baseURL / webServer.url）とセッション Cookie の
 * domain が同じ値を指す必要があるため、両者が同じ定数を参照する。
 * ここがずれると Cookie が送られず、原因の分かりにくいタイムアウトになる。
 */
export const E2E_BASE_URL = "http://127.0.0.1:3000";

export const E2E_HOSTNAME = new URL(E2E_BASE_URL).hostname;
