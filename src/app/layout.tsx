import Footer from "@/components/common/footer";
import { PATH } from "@/const/Path";
import { SITE } from "@/const/Site";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"], // latinだけを指定して軽量化
  weight: ["400", "500", "700"], // 通常、Medium、Bold
  variable: "--font-noto-sans-jp", // CSS変数として使用可能にする
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  title: SITE.TITLE + " | " + SITE.DESCRIPTION,
  description: SITE.DESCRIPTION,
  keywords: SITE.KEYWORDS,
  openGraph: {
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    type: "website",
    locale: "ja_JP",
    url: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
    siteName: SITE.TITLE,
    images: [
      {
        url: new URL(process.env.NEXT_PUBLIC_BASE_URL! + PATH.OGP),
        width: 1200,
        height: 630,
        alt: SITE.TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [new URL(process.env.NEXT_PUBLIC_BASE_URL! + PATH.OGP)],
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
      </head>
      <body className={`${notoSansJP.variable} antialiased`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
