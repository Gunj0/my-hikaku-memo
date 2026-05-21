import { expect, test } from "@playwright/test";

test("未ログインでも基本フローで評価入力まで進める", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "新しいメモを作る" }).click();

  await expect(page.getByRole("heading", { name: "カテゴリ" })).toBeVisible();

  const nextButton = page.getByRole("button", { name: "次へ" });
  await expect(nextButton).toBeDisabled();

  await page.getByLabel("その他のカテゴリ").fill("スマホ");
  await expect(nextButton).toBeEnabled();

  await nextButton.click();

  await expect(
    page.getByRole("heading", { name: "比較ポイントと優先度" }),
  ).toBeVisible();
  await expect(page.getByText("価格")).toBeVisible();
  await expect(page.getByText("機能・スペック")).toBeVisible();
  await expect(nextButton).toBeEnabled();

  await nextButton.click();

  await expect(
    page.getByRole("heading", { name: "候補製品を洗い出す" }),
  ).toBeVisible();
  await expect(nextButton).toBeDisabled();

  const productInput = page.getByLabel("製品を追加");

  await productInput.fill("iPhone 16");
  await page.getByRole("button", { name: "追加" }).click();

  await productInput.fill("Pixel 10");
  await page.getByRole("button", { name: "追加" }).click();

  await expect(page.getByText("iPhone 16")).toBeVisible();
  await expect(page.getByText("Pixel 10")).toBeVisible();
  await expect(nextButton).toBeEnabled();

  await nextButton.click();

  await expect(page.getByRole("heading", { name: "評価を入力" })).toBeVisible();
});
