import { expect, test } from "@playwright/test";

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

const persistedDraftStorageKey = "gadget-comparison-auth-draft";

test("ホーム初期表示でヘッダーを表示する", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("オレの比較メモ")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Googleでログイン" }),
  ).toBeVisible();
});

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
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        redirectTo: "/memos/new",
        currentStep: 4,
        data: {
          ...savedMemoResponse.memo.data,
          category: "編集中のカテゴリ",
        },
        savedSnapshot: savedMemoResponse.memo.data,
        activeMemo: {
          id: savedMemoResponse.memo.id,
          title: savedMemoResponse.memo.title,
          category: savedMemoResponse.memo.category,
          isPublic: savedMemoResponse.memo.isPublic,
          createdAt: savedMemoResponse.memo.createdAt,
          updatedAt: savedMemoResponse.memo.updatedAt,
        },
        memoTitle: savedMemoResponse.memo.title,
        memoIsPublic: savedMemoResponse.memo.isPublic,
      },
    },
  );

  await page.goto("/memos/new");

  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();
  await expect(page.getByText("保存済みスマホ比較")).toBeVisible();

  await page.getByRole("button", { name: /カテゴリ/ }).click();
  const categoryInput = page.getByLabel("その他のカテゴリ");

  await expect(categoryInput).toHaveValue("編集中のカテゴリ");
  await categoryInput.fill("さらに編集中のカテゴリ");
  await expect(categoryInput).toHaveValue("さらに編集中のカテゴリ");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "元に戻す" }).click();

  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();
  await page.getByRole("button", { name: /カテゴリ/ }).click();
  await expect(categoryInput).toHaveValue("保存済みスマホ");
});

test("候補製品を削除すると最終ステップは保存できない", async ({ page }) => {
  await page.goto("/memos/new");

  await page.getByRole("button", { name: /候補/ }).click();

  const productInput = page.getByLabel("製品を追加");
  await productInput.fill("iPhone 16");
  await page.getByRole("button", { name: "追加" }).click();
  await productInput.fill("Pixel 10");
  await page.getByRole("button", { name: "追加" }).click();

  await page.getByRole("button", { name: /結論/ }).click();
  await page.getByRole("button", { name: /iPhone 16/ }).click();

  const saveButton = page
    .getByRole("contentinfo")
    .getByRole("button", { name: "保存" });
  await expect(saveButton).toBeEnabled();

  await page.getByRole("button", { name: /候補/ }).click();
  await page.getByRole("button", { name: "Pixel 10を削除" }).click();

  await page.getByRole("button", { name: /結論/ }).click();
  await expect(saveButton).toBeDisabled();
});

test("ログイン遷移イベントで編集中の内容を退避する", async ({ page }) => {
  await page.goto("/memos/new");

  await page.getByLabel("その他のカテゴリ").fill("ミラーレスカメラ");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("gadget-comparison:before-sign-in"));
  });

  const persistedDraft = await page.evaluate((storageKey) => {
    const rawDraft = window.sessionStorage.getItem(storageKey);

    return rawDraft ? JSON.parse(rawDraft) : null;
  }, persistedDraftStorageKey);

  expect(persistedDraft).toMatchObject({
    redirectTo: "/memos/new",
    currentStep: 1,
    memoIsPublic: false,
    data: {
      category: "ミラーレスカメラ",
    },
  });
});

test("ログイン復帰時に編集中の内容を復元する", async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        redirectTo: "/memos/new",
        currentStep: 3,
        data: {
          category: "ミラーレスカメラ",
          categoryMemo: "夜景を撮りたい",
          decisionPoints: [
            {
              id: "point-price",
              name: "価格",
              isImportant: true,
              weight: 3,
              memo: "",
            },
          ],
          pointsMemo: "予算優先",
          products: [
            {
              id: "camera-a",
              name: "Camera A",
              memo: "軽さ重視",
            },
            {
              id: "camera-b",
              name: "Camera B",
              memo: "",
            },
          ],
          productsMemo: "店頭で触って決める",
          scores: [],
          selectedProductId: null,
          decisionMemo: "",
        },
        savedSnapshot: null,
        activeMemo: null,
        memoTitle: "",
        memoIsPublic: false,
      },
    },
  );

  await page.goto("/memos/new");

  await expect(
    page.getByRole("heading", { name: "候補製品を洗い出す" }),
  ).toBeVisible();
  await expect(page.getByLabel("全体メモ（任意）")).toHaveValue(
    "店頭で触って決める",
  );
  await expect(page.getByText("Camera A")).toBeVisible();

  await page.getByRole("button", { name: /カテゴリ/ }).click();
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue(
    "ミラーレスカメラ",
  );
  await expect(page.getByLabel("メモ（任意）")).toHaveValue("夜景を撮りたい");
});
