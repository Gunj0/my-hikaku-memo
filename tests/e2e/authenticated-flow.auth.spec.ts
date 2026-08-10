import { expect, test } from "@playwright/test";

import type { ComparisonData } from "@/lib/types";

import { TEST_USER } from "./support/test-user";

/**
 * ログイン状態の E2E。
 *
 * storageState は auth.setup.ts が用意する（playwright.config.ts の
 * chromium-auth プロジェクト）。テストごとに新しいブラウザコンテキストになるため
 * localStorage / sessionStorage は空から始まる。
 *
 * テストユーザーは全テストで共有するので、保存したメモは他テストからも見える。
 * 一覧の検証は各テスト固有のタイトルで絞り込むこと。
 */

function buildComparisonData(overrides: Partial<ComparisonData> = {}) {
  return {
    // プリセットに無いカテゴリ。プリセット名だと「その他のカテゴリ」欄が空のままになる。
    category: "ゲーミングマウス",
    categoryMemo: "",
    decisionPoints: [
      { id: "point-price", name: "価格", weight: 3, memo: "" },
      { id: "point-weight", name: "重さ", weight: 2, memo: "" },
    ],
    pointsMemo: "",
    products: [
      { id: "product-a", name: "マウスA", memo: "" },
      { id: "product-b", name: "マウスB", memo: "" },
    ],
    productsMemo: "",
    scores: [],
    selectedProductId: "product-a",
    decisionMemo: "",
    ...overrides,
  } satisfies ComparisonData;
}

test("ログイン状態のヘッダーはログインボタンではなくマイページへの導線を出す", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "ログイン" })).toHaveCount(0);
  await expect(page.locator(`a[href="/${TEST_USER.username}"]`)).toBeVisible();
  await expect(page.getByRole("link", { name: "新規メモ" })).toBeVisible();
});

test("自分のメモ一覧では所有者向けの操作を表示する", async ({ page }) => {
  await page.goto(`/${TEST_USER.username}`);

  await expect(
    page.getByRole("heading", { name: TEST_USER.name }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "アカウント設定" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "新しいメモを作る" }),
  ).toBeVisible();
});

test("編集画面から比較メモを保存し、一覧に表示する", async ({ page }) => {
  const memoTitle = `UI保存テスト-${Date.now()}`;

  await page.goto("/edit");

  await page.getByLabel("その他のカテゴリ").fill("ヘッドホン");

  await page.getByRole("button", { name: /候補/ }).click();
  const productInput = page.getByLabel("候補を追加");
  await productInput.fill("ヘッドホンA");
  await page.getByRole("button", { name: "追加" }).click();
  await productInput.fill("ヘッドホンB");
  await page.getByRole("button", { name: "追加" }).click();

  await page.getByRole("button", { name: /結論/ }).click();
  await page.getByRole("button", { name: /ヘッドホンA/ }).click();

  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "保存" })
    .click();

  const saveDialog = page.getByRole("dialog");
  await expect(saveDialog.getByText("比較メモを保存")).toBeVisible();
  await saveDialog.getByLabel("メモタイトル").fill(memoTitle);
  await saveDialog.getByRole("button", { name: "保存", exact: true }).click();

  await expect(page.getByText("メモを保存しました。")).toBeVisible();
  // 保存後は新規作成 URL から memoId 付き URL へ差し替わる。
  await expect(page).toHaveURL(/\/edit\?memoId=/);

  // 一覧のメモタイトルは CardTitle（div）なので heading では引けない。
  await page.goto(`/${TEST_USER.username}`);
  await expect(page.getByText(memoTitle)).toBeVisible();
});

test("保存済みメモを memoId 付き URL で開いて上書き保存できる", async ({
  page,
}) => {
  const memoTitle = `更新テスト-${Date.now()}`;
  // 画面操作で作り直すと保存フローのテストと重複するため、API で用意する。
  // page.request はコンテキストの Cookie を共有するのでログイン済みで呼べる。
  const createResponse = await page.request.post("/api/memos", {
    data: {
      title: memoTitle,
      isPublic: false,
      data: buildComparisonData(),
    },
  });

  expect(createResponse.status()).toBe(201);
  const { memo } = (await createResponse.json()) as { memo: { id: string } };

  await page.goto(`/edit?memoId=${memo.id}`);

  await expect(page.getByText("保存済みメモを読み込みました。")).toBeVisible();

  // 読み込み後の表示ステップは入力済みの範囲から決まるため、カテゴリへ明示的に移動する。
  await page.getByRole("button", { name: /カテゴリ/ }).click();
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue(
    "ゲーミングマウス",
  );

  await page.getByLabel("その他のカテゴリ").fill("ゲーミングマウス（更新後）");

  await page
    .getByRole("banner")
    .getByRole("button", { name: "保存" })
    .click();

  const saveDialog = page.getByRole("dialog");
  await expect(saveDialog.getByLabel("メモタイトル")).toHaveValue(memoTitle);
  await saveDialog.getByRole("button", { name: "上書き保存" }).click();

  await expect(page.getByText("メモを更新しました。")).toBeVisible();

  // 画面の状態は localStorage のドラフトからも復元されうるので、
  // 永続化されたことは API 経由で確認する。
  const updatedResponse = await page.request.get(`/api/memos/${memo.id}`);
  const updated = (await updatedResponse.json()) as {
    memo: { data: ComparisonData };
  };

  expect(updated.memo.data.category).toBe("ゲーミングマウス（更新後）");
});

test("公開メモは閲覧モードで表示できる", async ({ page }) => {
  const memoTitle = `公開テスト-${Date.now()}`;
  const createResponse = await page.request.post("/api/memos", {
    data: {
      title: memoTitle,
      isPublic: true,
      data: buildComparisonData({ category: "モニター" }),
    },
  });

  expect(createResponse.status()).toBe(201);
  const { memo } = (await createResponse.json()) as { memo: { id: string } };

  await page.goto(`/${TEST_USER.username}/${memo.id}`);

  await expect(page.getByText(memoTitle)).toBeVisible();
  await expect(page.getByText("マウスA").first()).toBeVisible();
});

test("アカウント設定に現在のプロフィールを表示する", async ({ page }) => {
  await page.goto("/settings");

  await expect(page.getByLabel(/公開ユーザー名/)).toHaveValue(TEST_USER.name);
  await expect(page.getByLabel(/ユーザーID/)).toHaveValue(TEST_USER.username);
  await expect(page.getByRole("button", { name: "ログアウト" })).toBeVisible();
});
