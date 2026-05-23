import type { MetadataRoute } from "next";

import { listPublicComparisonMemosForSitemap } from "@/lib/server/comparison-memos";
import { toAbsoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicMemos = await listPublicComparisonMemosForSitemap();

  return [
    {
      url: toAbsoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    ...publicMemos.map((memo) => ({
      url: toAbsoluteUrl(`/memos/${memo.id}`),
      lastModified: new Date(memo.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
