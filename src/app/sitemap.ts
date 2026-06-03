import type { MetadataRoute } from "next";

import { getAbsoluteUrl, getRequestSiteUrl } from "@/lib/seo";
import { listPublicComparisonMemoSitemapEntries } from "@/lib/server/comparison-memos";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getRequestSiteUrl();
  const publicMemos = await listPublicComparisonMemoSitemapEntries();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/terms", siteUrl),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: getAbsoluteUrl("/privacy", siteUrl),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: getAbsoluteUrl("/commercial-disclosure", siteUrl),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  return [
    {
      url: getAbsoluteUrl("/", siteUrl),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...staticPages,
    ...publicMemos.map((memo) => ({
      url: getAbsoluteUrl(`/memos/${memo.id}`, siteUrl),
      lastModified: new Date(memo.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
