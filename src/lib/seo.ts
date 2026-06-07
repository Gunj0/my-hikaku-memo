import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { headers } from "next/headers";

const DEFAULT_SITE_URL = "http://localhost:3000";
const SITE_NAME = "オレの比較メモ";
const DEFAULT_OG_IMAGE = "/opengraph-image";

function normalizeSiteUrl(value?: string) {
  if (!value) {
    return DEFAULT_SITE_URL;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getRuntimeEnvSiteUrl() {
  try {
    const { env } = getCloudflareContext();
    const runtimeEnv = env as Partial<
      CloudflareEnv & {
        NEXT_PUBLIC_SITE_URL: string;
        SITE_URL: string;
      }
    >;

    const configuredUrl =
      runtimeEnv.NEXT_PUBLIC_SITE_URL ?? runtimeEnv.SITE_URL;

    return configuredUrl ? normalizeSiteUrl(configuredUrl) : undefined;
  } catch {
    return undefined;
  }
}

function getConfiguredSiteUrl() {
  return (
    getRuntimeEnvSiteUrl() ??
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL)
  );
}

function buildSiteUrlFromHeaders(
  headerStore: Awaited<ReturnType<typeof headers>>,
) {
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return undefined;
  }

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return normalizeSiteUrl(`${protocol}://${host}`);
}

function isLoopbackSiteUrl(siteUrl: string) {
  try {
    const hostname = new URL(siteUrl).hostname;

    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}

function assertSafeConfiguredSiteUrl(siteUrl?: string) {
  if (process.env.NEXTJS_ENV !== "production") {
    return;
  }

  if (!siteUrl || isLoopbackSiteUrl(siteUrl)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL または SITE_URL に本番公開 URL を設定してください。",
    );
  }
}

export function getSiteUrl() {
  const configuredSiteUrl = getConfiguredSiteUrl();

  assertSafeConfiguredSiteUrl(configuredSiteUrl);

  return configuredSiteUrl;
}

export async function getRequestSiteUrl() {
  const configuredSiteUrl = getConfiguredSiteUrl();

  assertSafeConfiguredSiteUrl(configuredSiteUrl);

  if (configuredSiteUrl && !isLoopbackSiteUrl(configuredSiteUrl)) {
    return configuredSiteUrl;
  }

  try {
    if (process.env.NEXTJS_ENV !== "production") {
      const headerStore = await headers();
      const siteUrl = buildSiteUrlFromHeaders(headerStore);

      if (siteUrl && isLoopbackSiteUrl(siteUrl)) {
        return siteUrl;
      }
    }
  } catch {
    // headers() is unavailable during static evaluation.
  }

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  return DEFAULT_SITE_URL;
}

export function getAbsoluteUrl(path = "/", siteUrl = getSiteUrl()) {
  return new URL(path, `${normalizeSiteUrl(siteUrl)}/`).toString();
}

export function getDefaultOgImageUrl(siteUrl = getSiteUrl()) {
  return getAbsoluteUrl(DEFAULT_OG_IMAGE, siteUrl);
}
export function serializeJsonLd(jsonLd: Record<string, unknown>) {
  return JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  siteUrl?: string;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  keywords,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  siteUrl,
}: BuildMetadataInput): Metadata {
  const resolvedSiteUrl = normalizeSiteUrl(siteUrl ?? getSiteUrl());
  const canonical = getAbsoluteUrl(path, resolvedSiteUrl);
  const ogImage = image ?? getDefaultOgImageUrl(resolvedSiteUrl);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type,
      locale: "ja_JP",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    metadataBase: new URL(resolvedSiteUrl),
  };
}

export function buildArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  publishedTime: string;
  modifiedTime: string;
  authorName: string;
  siteUrl?: string;
}) {
  const resolvedSiteUrl = normalizeSiteUrl(input.siteUrl ?? getSiteUrl());
  const image = input.image ?? getDefaultOgImageUrl(resolvedSiteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: "ja-JP",
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime,
    mainEntityOfPage: getAbsoluteUrl(input.path, resolvedSiteUrl),
    image: [image],
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: getDefaultOgImageUrl(resolvedSiteUrl),
      },
    },
  };
}
