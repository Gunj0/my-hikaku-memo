import type { MetadataRoute } from "next";

import { getRequestSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getRequestSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/memos/"],
        disallow: ["/api/", "/memos/new"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
