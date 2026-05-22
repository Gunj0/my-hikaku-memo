import { expect, test } from "@playwright/test";

test("ホームに検索と共有向けのメタデータが設定されている", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("オレの比較メモ");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /http:\/\/127\.0\.0\.1:3000\/?$/,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/,
  );
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(structuredData).toContain('"@type":"WebApplication"');
});

test("robots.txt と sitemap.xml が公開SEO設定を返す", async ({ request }) => {
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBeTruthy();
  const robotsText = await robotsResponse.text();
  expect(robotsText).toContain("Sitemap: http://127.0.0.1:3000/sitemap.xml");

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemapText = await sitemapResponse.text();
  expect(sitemapText).toContain("<loc>http://127.0.0.1:3000/</loc>");
});
