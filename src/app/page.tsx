import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildMetadata,
  getAbsoluteUrl,
  getDefaultOgImageUrl,
  getRequestSiteUrl,
  serializeJsonLd,
} from "@/lib/seo";
import { listRandomComparisonMemos } from "@/lib/server/comparison-memos";
import {
  BookMarkedIcon,
  EyeIcon,
  PlusCircleIcon,
  RefreshCwIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title: "オレの比較メモ | ガジェットや家電の比較メモを公開・共有",
    description:
      "ガジェットや家電の比較ポイント、評価、最終判断をまとめて残せる比較メモアプリ。公開メモを閲覧しながら自分の比較メモもすぐ作成できます。",
    path: "/",
    keywords: [
      "比較メモ アプリ",
      "ガジェット 比較 メモ",
      "家電 比較 メモ",
      "購入 比較",
      "公開メモ",
    ],
    siteUrl,
  });
}

function getAuthorLabel(name: string | null) {
  return name?.trim() || "匿名ユーザー";
}

function getInitials(name: string | null) {
  return getAuthorLabel(name).slice(0, 2).toUpperCase();
}

export default async function Home() {
  const session = await auth();
  const publicMemos = await listRandomComparisonMemos(6, session?.user?.id);
  const siteUrl = await getRequestSiteUrl();
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "オレの比較メモ",
    url: getAbsoluteUrl("/", siteUrl),
    inLanguage: "ja-JP",
    description:
      "ガジェットや家電の比較ポイント、評価、最終判断をまとめて残せる比較メモアプリ。",
    image: [getDefaultOgImageUrl(siteUrl)],
  };
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "オレの比較メモ",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "ja-JP",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    url: getAbsoluteUrl("/", siteUrl),
    image: [getDefaultOgImageUrl(siteUrl)],
    description:
      "比較ポイントと最終判断を整理し、公開メモとして共有できる Web アプリ。",
  };

  return (
    <main className="mx-auto flex w-full flex-col gap-6 px-4 py-6 md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(softwareApplicationJsonLd),
        }}
      />
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
        <Card className="overflow-hidden border-border/80 bg-card/78">
          <CardHeader className="space-y-4 pb-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl leading-tight md:text-3xl">
                あなただけの「比較メモ」を残そう
              </CardTitle>
              <CardDescription className="max-w-2xl text-md leading-6 text-muted-foreground">
                <p>なんで選んだっけ？をちゃんと残すためのアプリ</p>
                <p>次のガジェット、家電を選ぶときの参考に</p>
              </CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-primary/30 bg-primary/8 p-4">
                <p className="mt-2 text-lg font-semibold">
                  さっそく比較メモを作る
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  ログインしなくても作り始めることができます
                </p>
                <div className="mt-4">
                  <Button asChild variant="success">
                    <Link href="/memos/new">
                      <PlusCircleIcon className="h-4 w-4" />
                      無料で比較メモを作る
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="mt-2 text-lg font-semibold">
                  保存したメモを確認する
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  ログインすると自分のメモ一覧を確認できます
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href="/memos">
                      <BookMarkedIcon className="h-4 w-4" />
                      メモ一覧へ
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border/80 bg-card/74">
          <CardHeader>
            <CardTitle className="text-xl">このアプリでできること</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              開発中...
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex gap-2 flex-row items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">みんなの比較メモ</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <RefreshCwIcon className="h-4 w-4" />
              更新
            </Link>
          </Button>
        </div>

        {publicMemos.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg">
                表示できる公開メモがまだありません
              </CardTitle>
              <CardDescription>
                まずは自分で比較メモを作成し、保存時に公開設定をオンにするとここに表示されます。
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicMemos.map((memo) => (
              <Card key={memo.id} className="border-border/80 bg-card/72">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9 border border-border/70">
                        <AvatarImage
                          src={memo.author.image ?? undefined}
                          alt={getAuthorLabel(memo.author.name)}
                        />
                        <AvatarFallback>
                          {getInitials(memo.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {getAuthorLabel(memo.author.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(memo.updatedAt).toLocaleString("ja-JP")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="line-clamp-2 text-lg leading-7">
                      {memo.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      カテゴリ: {memo.category || "未設定"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <Link href={`/memos/${memo.id}`}>
                      閲覧する
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-card/72">
          <CardHeader>
            <CardTitle className="text-lg">新規作成へ進む</CardTitle>
            <CardDescription>
              比較対象が決まっているなら、すぐに入力フローを開始できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="success">
              <Link href="/memos/new">
                <PlusCircleIcon className="h-4 w-4" />
                新しい比較メモを作る
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/72">
          <CardHeader>
            <CardTitle className="text-lg">マイメモ一覧へ進む</CardTitle>
            <CardDescription>
              保存済みメモを開いて再編集したり、閲覧モードで内容だけ確認できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/memos">
                <BookMarkedIcon className="h-4 w-4" />
                作成済みメモ一覧を見る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/80 pt-6 text-sm text-muted-foreground">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-foreground/85">
              &copy; {new Date().getFullYear()} オレの比較メモ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href="https://x.com/gunj0dev"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Gunj0
            </a>
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
            <Link href="/commercial-disclosure">特商法表記</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
