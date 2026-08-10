import { expect, test as setup } from "@playwright/test";

import {
  AUTH_STORAGE_STATE_PATH,
  TEST_USER,
  buildSessionCookie,
  seedTestUser,
} from "./support/test-user";

/**
 * ログイン済みプロジェクト（chromium-auth）の前提を用意する。
 *
 * ここで作った storageState を各テストが読み込むため、テスト本体は
 * ログイン処理を書かずに済む。
 */
setup("ログイン済みの storageState を作る", async ({ context, page }) => {
  const { expires } = seedTestUser();

  await context.addCookies([buildSessionCookie(expires)]);

  // Cookie が実際にセッションとして解決されることをここで確認しておく。
  // 失敗したときに個々のテストではなく setup が落ちるので原因が特定しやすい。
  // アバターは Radix Avatar の画像読み込み前後でアクセシブル名が変わるため、
  // 遷移先の href で特定する。
  await page.goto("/");
  await expect(page.locator(`a[href="/${TEST_USER.username}"]`)).toBeVisible();
  await expect(page.getByRole("button", { name: "ログイン" })).toHaveCount(0);

  await context.storageState({ path: AUTH_STORAGE_STATE_PATH });
});
