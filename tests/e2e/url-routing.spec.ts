import { expect, test } from "@playwright/test";

/**
 * `/{username}` / `/{username}/{memoId}` へのルーティング移行を検証する。
 * 公開メモに依存するケースは、ホームの一覧から実データを引いて組み立てる。
 */

/** ホームの公開メモカードから `/{username}/{memoId}` を 1 件取得する。 */
async function findPublicMemoPath(page: import("@playwright/test").Page) {
  await page.goto("/");

  const links = await page.locator("main a[href]").evaluateAll((nodes) =>
    nodes
      .map((node) => node.getAttribute("href") ?? "")
      .filter((href) => /^\/[a-z0-9][a-z0-9_-]*\/\d+$/.test(href)),
  );

  return links[0] ?? null;
}

test("削除した /memos と /memos/edit は 404 を返す", async ({ page }) => {
  for (const path of ["/memos", "/memos/edit"]) {
    const response = await page.goto(path);

    expect(response?.status(), `${path} が 404 ではない`).toBe(404);
  }
});

test("旧 /memos/{memoId} は所有者の正規 URL へ寄せられる", async ({ page }) => {
  // memoId がグローバル一意なため、`memos` を古いハンドルとみなして
  // `/{username}/{memoId}` へ 308 で寄せられる。互換ルートは持たない。
  const memoPath = await findPublicMemoPath(page);

  test.skip(!memoPath, "公開メモが 1 件も無いため検証できない");

  const memoId = memoPath!.split("/").pop();

  await page.goto(`/memos/${memoId}`);

  await expect(page).toHaveURL(memoPath!);
});

test("存在しないユーザーIDは 404 を返す", async ({ page }) => {
  const response = await page.goto("/no-such-user-9999");

  expect(response?.status()).toBe(404);
});

test("予約語のパスは動的セグメントに食われない", async ({ page }) => {
  await page.goto("/edit");
  await expect(page).toHaveURL("/edit");
  await expect(page.getByRole("button", { name: "保存" })).toBeVisible();

  await page.goto("/settings");
  await expect(page).toHaveURL("/settings");
  await expect(page.getByText("アカウント設定").first()).toBeVisible();

  await page.goto("/terms");
  await expect(page).toHaveURL("/terms");
});

test("公開メモは /{username}/{memoId} で閲覧できる", async ({ page }) => {
  const memoPath = await findPublicMemoPath(page);

  test.skip(!memoPath, "公開メモが 1 件も無いため検証できない");

  const response = await page.goto(memoPath!);

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(memoPath!);
  await expect(page.getByRole("link", { name: "メモ一覧" })).toBeVisible();
});

test("username が一致しない URL は正規 URL へリダイレクトする", async ({
  page,
}) => {
  const memoPath = await findPublicMemoPath(page);

  test.skip(!memoPath, "公開メモが 1 件も無いため検証できない");

  const memoId = memoPath!.split("/").pop();

  // memoId はグローバル一意なので、別のハンドルからでも所有者へ寄せられる。
  await page.goto(`/someone-else/${memoId}`);

  await expect(page).toHaveURL(memoPath!);
});

test("メモ一覧リンクから所有者のプロフィールへ遷移できる", async ({ page }) => {
  const memoPath = await findPublicMemoPath(page);

  test.skip(!memoPath, "公開メモが 1 件も無いため検証できない");

  const username = memoPath!.split("/")[1];

  await page.goto(memoPath!);
  await page.getByRole("link", { name: "メモ一覧" }).click();

  await expect(page).toHaveURL(`/${username}`);
  await expect(page.getByRole("heading", { name: "比較メモ" })).toBeVisible();
});

test("robots.txt は新しい操作系パスを拒否する", async ({ request }) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(body).toContain("Disallow: /edit");
  expect(body).toContain("Disallow: /settings");
  expect(body).not.toContain("/memos");
});

test("sitemap.xml は /{username}/{memoId} 形式で公開メモを列挙する", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(body).not.toContain("/memos/");

  const memoUrls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((path) => /^\/[a-z0-9][a-z0-9_-]*\/\d+$/.test(path));

  for (const path of memoUrls) {
    const username = path.split("/")[1];

    // メモを載せたなら、その所有者のプロフィールも載っていること。
    expect(body).toContain(`${username}</loc>`);
  }
});
