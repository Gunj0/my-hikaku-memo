import Link from "next/link";

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
import { listRandomComparisonMemos } from "@/lib/server/comparison-memos";
import {
  ArrowRightIcon,
  BookMarkedIcon,
  EyeIcon,
  PlusCircleIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getAuthorLabel(name: string | null) {
  return name?.trim() || "匿名ユーザー";
}

function getInitials(name: string | null) {
  return getAuthorLabel(name).slice(0, 2).toUpperCase();
}

export default async function Home() {
  const session = await auth();
  const publicMemos = await listRandomComparisonMemos(6, session?.user?.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
        <Card className="overflow-hidden border-border/80 bg-card/78">
          <CardHeader className="space-y-4 pb-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl leading-tight md:text-3xl">
                あなただけの比較過程を残そう
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                ガジェットや家電の比較判断理由を、わかりやすくメモするためのアプリ
              </CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-primary/30 bg-primary/8 p-4">
                <p className="mt-2 text-lg font-semibold">
                  新しい比較メモを作る
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  カテゴリから順番に比較条件を整理して、結論まで保存できます。
                </p>
                <div className="mt-4">
                  <Button asChild variant="success">
                    <Link href="/memos/new">
                      <PlusCircleIcon className="h-4 w-4" />
                      新しい比較メモを作る
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="mt-2 text-lg font-semibold">
                  保存済みメモを確認する
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  ログインしていれば自分のメモ一覧から再開できます。未ログインでも画面には入れます。
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href="/memos">
                      メモ一覧へ
                      <BookMarkedIcon className="h-4 w-4" />
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
              新規作成画面では、比較ポイント、候補製品、評価、最終決定までを一連で編集できます。
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              マイメモ一覧画面では、自分が保存した比較メモの再開と閲覧モードへの移動ができます。
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              下のランダム一覧からは、他ユーザーのメモを編集不可の閲覧モードで確認できます。
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">他の人が作ったメモ</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              表示を更新
              <ArrowRightIcon className="h-4 w-4" />
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
                まずは自分で比較メモを作成し、データがたまるとここに他ユーザーのメモが表示されます。
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
                    <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      read only
                    </span>
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
                      閲覧モードで見る
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
    </main>
  );
}
