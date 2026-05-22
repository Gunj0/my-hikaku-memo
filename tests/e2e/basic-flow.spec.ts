import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const authenticatedSession = {
  user: {
    id: "user-1",
    name: "Playwright User",
    email: "playwright@example.com",
    image: null,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

const savedMemoResponse = {
  memo: {
    id: "saved-memo",
    title: "保存済みスマホ比較",
    category: "保存済みスマホ",
    isPublic: false,
    createdAt: "2026-05-21T00:00:00.000Z",
    updatedAt: "2026-05-21T00:00:00.000Z",
    data: {
      category: "保存済みスマホ",
      categoryMemo: "保存済みメモ",
      decisionPoints: [
        {
          id: "point-price",
          name: "価格",
          isImportant: true,
          weight: 3,
          memo: "",
        },
        {
          id: "point-spec",
          name: "機能・スペック",
          isImportant: true,
          weight: 3,
          memo: "",
        },
      ],
      pointsMemo: "",
      products: [
        {
          id: "product-iphone",
          name: "iPhone 16",
          memo: "",
        },
        {
          id: "product-pixel",
          name: "Pixel 10",
          memo: "",
        },
      ],
      productsMemo: "",
      scores: [],
      selectedProductId: null,
      decisionMemo: "",
    },
  },
};

async function mockAuthenticatedSession(page: Page) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(authenticatedSession),
    });
  });
}

async function mockAuthenticatedMemoLoad(page: Page) {
  await mockAuthenticatedSession(page);

  await page.route("**/api/memos/saved-memo", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(savedMemoResponse),
    });
  });
}

test("ステップは未入力でも常に自由に移動できる", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "新しい比較メモを作る" }).click();

  const nextButton = page.getByRole("button", { name: "次へ" });
  await expect(nextButton).toBeEnabled();

  await page.getByRole("button", { name: /結論/ }).click();
  await expect(page.getByRole("heading", { name: "最終決定" })).toBeVisible();

  await page.getByRole("button", { name: /評価/ }).click();
  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();

  await page.getByRole("button", { name: /カテゴリ/ }).click();
  await expect(page.getByRole("heading", { name: "カテゴリ" })).toBeVisible();

  await nextButton.click();
  await expect(
    page.getByRole("heading", { name: "比較ポイントと優先度" }),
  ).toBeVisible();
});

test("保存済みメモのリセットは保存時点の状態へ戻る", async ({ page }) => {
  await mockAuthenticatedMemoLoad(page);

  await page.goto("/memos/new?memoId=saved-memo");

  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();
  await expect(page.getByText("保存済みスマホ比較")).toBeVisible();

  await page.getByRole("button", { name: /カテゴリ/ }).click();
  const categoryInput = page.getByLabel("その他のカテゴリ");

  await expect(categoryInput).toHaveValue("保存済みスマホ");
  await categoryInput.fill("編集中のカテゴリ");
  await expect(categoryInput).toHaveValue("編集中のカテゴリ");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "元に戻す" }).click();

  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();
  await page.getByRole("button", { name: /カテゴリ/ }).click();
  await expect(categoryInput).toHaveValue("保存済みスマホ");
});

test("候補製品を削除すると最終ステップは完了できない", async ({ page }) => {
  await page.goto("/memos/new");

  await page.getByRole("button", { name: /候補/ }).click();

  const productInput = page.getByLabel("製品を追加");
  await productInput.fill("iPhone 16");
  await page.getByRole("button", { name: "追加" }).click();
  await productInput.fill("Pixel 10");
  await page.getByRole("button", { name: "追加" }).click();

  await page.getByRole("button", { name: /結論/ }).click();
  await page.getByRole("button", { name: /iPhone 16/ }).click();

  const completeButton = page.getByRole("button", { name: "完了" });
  await expect(completeButton).toBeEnabled();

  await page.getByRole("button", { name: /候補/ }).click();
  await page.getByRole("button", { name: "Pixel 10を削除" }).click();

  await page.getByRole("button", { name: /結論/ }).click();
  await expect(completeButton).toBeDisabled();
});
