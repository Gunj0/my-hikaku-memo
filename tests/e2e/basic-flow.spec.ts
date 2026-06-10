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
          weight: 3,
          memo: "",
        },
        {
          id: "point-spec",
          name: "機能・スペック",
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
const newComparisonDraftId = "__new__";
const guestDraftOwnerScope = "guest";
const userDraftOwnerScope = "user:test-user";

function getLocalDraftStorageKey(
  memoId: string | null,
  ownerScope = guestDraftOwnerScope,
) {
  return `gadget-comparison-local-draft:${ownerScope}:${memoId ?? newComparisonDraftId}`;
}

test("ホーム初期表示でヘッダーを表示する", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: /My Hikaku Memo オレの比較メモ β/ }),
  ).toBeVisible();

  const signInTrigger = page.getByRole("button", { name: "ログイン" });
  await expect(signInTrigger).toBeVisible();

  await signInTrigger.click();

  await expect(
    page.getByRole("button", { name: "Google でログイン" }),
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
  await expect(
    page.getByRole("heading", { name: "何を比較する？" }),
  ).toBeVisible();

  await nextButton.click();
  await expect(
    page.getByRole("heading", { name: "あなたが重視するポイントは？" }),
  ).toBeVisible();
});

test("評価テーブルの表示で hydration error を出さない", async ({ page }) => {
  const consoleMessages: string[] = [];

  page.on("console", (message) => {
    consoleMessages.push(message.text());
  });

  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        ownerScope: guestDraftOwnerScope,
        redirectTo: "/memos/new",
        currentStep: 4,
        data: savedMemoResponse.memo.data,
        savedSnapshot: null,
        activeMemo: null,
        memoTitle: "",
        memoIsPublic: false,
      },
    },
  );

  await page.goto("/memos/new");

  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();

  const hydrationErrors = consoleMessages.filter((message) =>
    /hydration|cannot be a child of <table>|cannot contain a nested <div>/i.test(
      message,
    ),
  );

  expect(hydrationErrors).toEqual([]);
});

test("guest の保存済みメモ由来 draft をリセットすると初期状態に戻る", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        ownerScope: guestDraftOwnerScope,
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

  await page.getByRole("button", { name: /カテゴリ/ }).click();
  const categoryInput = page.getByLabel("その他のカテゴリ");

  await expect(categoryInput).toHaveValue("編集中のカテゴリ");
  await categoryInput.fill("さらに編集中のカテゴリ");
  await expect(categoryInput).toHaveValue("さらに編集中のカテゴリ");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "元に戻す" }).click();

  await expect(
    page.getByRole("heading", { name: "何を比較する？" }),
  ).toBeVisible();
  await expect(categoryInput).toHaveValue("");
});

test("入力欄は保存上限を超える文字を保持しない", async ({ page }) => {
  await page.goto("/memos/new");

  await page.getByLabel("その他のカテゴリ").fill("a".repeat(130));
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue(
    "a".repeat(120),
  );

  await page.getByLabel("メモ（任意）").fill("b".repeat(5_100));
  await expect
    .poll(
      async () => (await page.getByLabel("メモ（任意）").inputValue()).length,
    )
    .toBe(5_000);

  await page.getByRole("button", { name: /候補/ }).click();
  await page.getByLabel("候補を追加").fill("c".repeat(130));
  await expect(page.getByLabel("候補を追加")).toHaveValue("c".repeat(120));
});

test("追加後のポイント名と候補名は各入力画面で編集できる", async ({ page }) => {
  await page.goto("/memos/new");

  await page.getByRole("button", { name: "次へ" }).click();

  await page.getByLabel("ポイントを追加").fill("保証");
  await page.getByRole("button", { name: "追加" }).click();

  const pointNameInput = page.locator('input[value="保証"]');
  await pointNameInput.fill("保証内容");
  await page.keyboard.press("Tab");
  await expect(page.locator('input[value="保証内容"]')).toBeVisible();

  await page.getByRole("button", { name: /候補/ }).click();
  await page.getByLabel("候補を追加").fill("モデルA");
  await page.getByRole("button", { name: "追加" }).click();

  const productNameInput = page.locator('input[value="モデルA"]');
  await productNameInput.fill("モデルA Pro");
  await page.keyboard.press("Tab");
  await expect(page.locator('input[value="モデルA Pro"]')).toBeVisible();

  await page.getByRole("button", { name: /評価/ }).click();

  const evaluationTable = page.getByRole("table");
  const evaluationPointInput = evaluationTable.locator(
    'input[value="保証内容"]',
  );
  await evaluationPointInput.fill("保証と耐久性");
  await page.keyboard.press("Tab");
  await expect(
    evaluationTable.locator('input[value="保証と耐久性"]'),
  ).toBeVisible();

  const evaluationProductInput = evaluationTable.locator(
    'input[value="モデルA Pro"]',
  );
  await evaluationProductInput.fill("モデルA Pro Max");
  await page.keyboard.press("Tab");
  await expect(
    evaluationTable.locator('input[value="モデルA Pro Max"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: /ポイント/ }).click();
  await expect(page.locator('input[value="保証と耐久性"]')).toBeVisible();

  await page.getByRole("button", { name: /候補/ }).click();
  await expect(page.locator('input[value="モデルA Pro Max"]')).toBeVisible();
});

test("比較ポイントと候補は30件までしか追加できない", async ({ page }) => {
  await page.goto("/memos/new");
  const initialPointCount = 4;
  const maxPointCount = 30;

  await page.getByRole("button", { name: "次へ" }).click();

  for (let index = 1; index <= maxPointCount - initialPointCount; index += 1) {
    await page.getByLabel("ポイントを追加").fill(`ポイント${index}`);
    await page.getByRole("button", { name: "追加" }).click();
  }

  await expect(page.getByRole("button", { name: /を削除$/ })).toHaveCount(
    maxPointCount,
  );
  await expect(page.getByLabel("ポイントを追加")).toBeDisabled();
  await expect(page.getByRole("button", { name: "追加" })).toBeDisabled();

  await page.getByRole("button", { name: /候補/ }).click();

  for (let index = 1; index <= 30; index += 1) {
    await page.getByLabel("候補を追加").fill(`候補${index}`);
    await page.getByRole("button", { name: "追加" }).click();
  }

  await expect(page.getByRole("button", { name: /を削除$/ })).toHaveCount(30);
  await expect(page.getByLabel("候補を追加")).toBeDisabled();
  await expect(page.getByRole("button", { name: "追加" })).toBeDisabled();
});

test("候補を削除すると最終ステップは保存できない", async ({ page }) => {
  await page.goto("/memos/new");

  await page.getByRole("button", { name: /候補/ }).click();

  const productInput = page.getByLabel("候補を追加");
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
    ownerScope: guestDraftOwnerScope,
    redirectTo: "/memos/new",
    currentStep: 1,
    memoIsPublic: false,
    data: {
      category: "ミラーレスカメラ",
    },
  });
});

test("未ログインで memoId 付き URL を開くと新規作成画面へ戻る", async ({
  page,
}) => {
  await page.goto(`/memos/new?memoId=${savedMemoResponse.memo.id}`);
  await expect(page).toHaveURL("/memos/new");
  await expect(
    page.getByRole("heading", { name: "何を比較する？" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("ログイン復帰時に編集中の内容を復元する", async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        ownerScope: guestDraftOwnerScope,
        redirectTo: "/memos/new",
        currentStep: 3,
        data: {
          category: "ミラーレスカメラ",
          categoryMemo: "夜景を撮りたい",
          decisionPoints: [
            {
              id: "point-price",
              name: "価格",
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
    page.getByRole("heading", { name: "気になる候補は？" }),
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

test("guest の memoId 付き session draft は新規作成として保存し直す", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        ownerScope: guestDraftOwnerScope,
        memoId: savedMemoResponse.memo.id,
        redirectTo: "/memos/new",
        currentStep: 1,
        data: savedMemoResponse.memo.data,
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

  await expect(page).toHaveURL("/memos/new");
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue(
    savedMemoResponse.memo.data.category,
  );

  await page.getByRole("button", { name: "次へ" }).click();

  const persistedDraft = await page.evaluate((storageKey) => {
    const rawDraft = window.localStorage.getItem(storageKey);

    return rawDraft ? JSON.parse(rawDraft) : null;
  }, getLocalDraftStorageKey(null));

  expect(persistedDraft).toMatchObject({
    ownerScope: guestDraftOwnerScope,
    memoId: null,
    redirectTo: "/memos/new",
    currentStep: 2,
  });

  expect(persistedDraft?.activeMemo).toBeNull();
  expect(persistedDraft?.savedSnapshot).toBeNull();
});

test("guest の memoId 付き session draft は URL に memoId を復元しない", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: persistedDraftStorageKey,
      value: {
        ownerScope: guestDraftOwnerScope,
        memoId: savedMemoResponse.memo.id,
        redirectTo: "/memos/new",
        currentStep: 3,
        data: {
          ...savedMemoResponse.memo.data,
          productsMemo: "URL 同期後も復元したいメモ",
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
  await expect(page).toHaveURL("/memos/new");

  await expect(
    page.getByRole("heading", { name: "気になる候補は？" }),
  ).toBeVisible();
  await expect(page.getByLabel("全体メモ（任意）")).toHaveValue(
    "URL 同期後も復元したいメモ",
  );
  await expect(
    page.getByRole("button", { name: "保存済みスマホ比較" }),
  ).toHaveCount(0);
});

test("新規作成画面では編集中の内容を localStorage へ即時保存する", async ({
  page,
}) => {
  await page.goto("/memos/new");

  await page.getByLabel("その他のカテゴリ").fill("モバイルバッテリー");
  await page.getByRole("button", { name: "次へ" }).click();

  const persistedDraft = await page.evaluate((storageKey) => {
    const rawDraft = window.localStorage.getItem(storageKey);

    return rawDraft ? JSON.parse(rawDraft) : null;
  }, getLocalDraftStorageKey(null));

  expect(persistedDraft).toMatchObject({
    ownerScope: guestDraftOwnerScope,
    memoId: null,
    redirectTo: "/memos/new",
    currentStep: 2,
    data: {
      category: "モバイルバッテリー",
    },
  });
});

test("新規作成画面では新規作成用ドラフトを復元し、他メモのドラフトは復元しない", async ({
  page,
}) => {
  await page.addInitScript(
    ({ entries }) => {
      entries.forEach(({ key, value }) => {
        window.localStorage.setItem(key, JSON.stringify(value));
      });
    },
    {
      entries: [
        {
          key: getLocalDraftStorageKey(savedMemoResponse.memo.id),
          value: {
            ownerScope: guestDraftOwnerScope,
            memoId: savedMemoResponse.memo.id,
            redirectTo: `/memos/new?memoId=${savedMemoResponse.memo.id}`,
            currentStep: 2,
            data: {
              ...savedMemoResponse.memo.data,
              category: "復元されてはいけないカテゴリ",
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
        {
          key: getLocalDraftStorageKey(null),
          value: {
            ownerScope: guestDraftOwnerScope,
            memoId: null,
            redirectTo: "/memos/new",
            currentStep: 2,
            data: {
              ...savedMemoResponse.memo.data,
              category: "新規ドラフトのカテゴリ",
            },
            savedSnapshot: null,
            activeMemo: null,
            memoTitle: "",
            memoIsPublic: false,
          },
        },
      ],
    },
  );

  await page.goto("/memos/new");

  await expect(
    page.getByRole("heading", { name: "あなたが重視するポイントは？" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /カテゴリ/ }).click();
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue(
    "新規ドラフトのカテゴリ",
  );
});

test("未ログインでは memoId キーの localStorage draft を復元しない", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: getLocalDraftStorageKey(savedMemoResponse.memo.id),
      value: {
        ownerScope: guestDraftOwnerScope,
        memoId: savedMemoResponse.memo.id,
        redirectTo: `/memos/new?memoId=${savedMemoResponse.memo.id}`,
        currentStep: 3,
        data: {
          ...savedMemoResponse.memo.data,
          productsMemo: "local draft から復元",
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

  await expect(
    page.getByRole("heading", { name: "何を比較する？" }),
  ).toBeVisible();
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue("");
});

test("guest は user スコープの localStorage ドラフトを復元しない", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    {
      key: getLocalDraftStorageKey(
        savedMemoResponse.memo.id,
        userDraftOwnerScope,
      ),
      value: {
        ownerScope: userDraftOwnerScope,
        memoId: savedMemoResponse.memo.id,
        redirectTo: `/memos/new?memoId=${savedMemoResponse.memo.id}`,
        currentStep: 3,
        data: {
          ...savedMemoResponse.memo.data,
          category: "復元されてはいけない user ドラフト",
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

  await expect(
    page.getByRole("heading", { name: "何を比較する？" }),
  ).toBeVisible();
  await expect(page.getByLabel("その他のカテゴリ")).toHaveValue("");
});
