import type { Metadata } from "next";

export const siteConfig = {
  name: "オレの比較メモ",
  defaultTitle: "オレの比較メモ",
  description:
    "ガジェットや家電の比較条件・評価・最終判断を整理し、そのまま公開メモとして共有できる比較メモアプリ",
  locale: "ja_JP",
  keywords: [
    "比較メモ",
    "製品比較",
    "家電比較",
    "ガジェット比較",
    "購入検討",
    "比較表",
    "レビュー整理",
  ],
  socialImageAlt: "オレの比較メモの紹介画像",
} as const;

const defaultSiteUrl = "http://127.0.0.1:3000";

function getConfiguredSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    defaultSiteUrl;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(defaultSiteUrl);
  }
}

function buildRobots(index: boolean): Metadata["robots"] {
  if (!index) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

type PageMetadataOptions = {
  title?: string;
  description?: string;
  path: string;
  index?: boolean;
};

export function getSiteUrl() {
  return getConfiguredSiteUrl();
}

export function toAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPageMetadata({
  title,
  description = siteConfig.description,
  path,
  index = true,
}: PageMetadataOptions): Metadata {
  const resolvedTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.defaultTitle;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: path,
    },
    robots: buildRobots(index),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: path,
      siteName: siteConfig.name,
      title: resolvedTitle,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: siteConfig.socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: ["/twitter-image"],
    },
  };
}

export function getWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: toAbsoluteUrl("/"),
    inLanguage: "ja-JP",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    featureList: [
      "比較ポイントと優先度を整理できる",
      "候補製品ごとの評価と最終判断を記録できる",
      "Googleログイン後に比較メモを保存・再開できる",
      "公開設定した比較メモを共有できる",
    ],
  };
}
