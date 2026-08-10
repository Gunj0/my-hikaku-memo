import { defineConfig, devices } from "@playwright/test";

import { E2E_BASE_URL } from "./tests/e2e/support/base-url";
import { AUTH_STORAGE_STATE_PATH } from "./tests/e2e/support/test-user";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3000",
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    // ログイン済み storageState を作る前処理。ローカル D1 を直接触るため
    // dev サーバー起動後（= migration 適用後）に走る必要がある。
    // 未ログインのテストはこれに依存させない。D1 のシードに失敗したときに
    // 本来独立して動けるテストまで巻き込んで skip させないため。
    // 後片付けは globalTeardown が担う（理由は tests/e2e/global-teardown.ts）。
    {
      name: "setup",
      testMatch: /auth\.setup\.ts$/,
    },
    // 未ログインのテスト。`*.auth.spec.ts` は対象外。
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /\.auth\.spec\.ts$/,
      testMatch: /\.spec\.ts$/,
    },
    // ログイン済みのテスト。ファイル名を `*.auth.spec.ts` にすると自動で対象になる。
    {
      name: "chromium-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STORAGE_STATE_PATH,
      },
      testMatch: /\.auth\.spec\.ts$/,
      dependencies: ["setup"],
    },
  ],
});
