import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { buildMetadata, getRequestSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return {
    ...buildMetadata({
      title: "オレの比較メモ | あなただけの比較・選択理由を残そう",
      description:
        "ガジェットや家電の比較・選択理由をしっかり残して整理できる比較メモアプリ。共有も簡単。購入後の満足度アップや、次の買い物の参考に。",
      path: "/",
      keywords: [
        "比較メモ",
        "ガジェット 比較",
        "家電 比較",
        "購入 判断",
        "レビュー 比較",
      ],
      siteUrl,
    }),
    icons: {
      icon: [
        {
          url: "/icon-light-32x32.png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/icon-dark-32x32.png",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: "/icon.svg",
          type: "image/svg+xml",
        },
      ],
      apple: "/apple-icon.png",
    },
    category: "technology",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ja" className="dark bg-background">
      <body
        className={`${plexMono.variable} ${jetBrainsMono.variable} font-sans antialiased min-h-dvh`}
      >
        <AuthSessionProvider session={session}>
          <AppHeader />
          {children}
          <Toaster richColors position="top-right" />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
