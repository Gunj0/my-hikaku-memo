import Link from "next/link";

import { auth } from "@/auth";
import { ProfileSettingsCard } from "@/components/profile-settings-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildMetadata, getRequestSiteUrl } from "@/lib/seo";
import { listComparisonMemos } from "@/lib/server/comparison-memos";
import {
  USER_PROFILE_NAME_MAX_LENGTH,
  ensureUserProfile,
} from "@/lib/server/user-profiles";
import { ArrowRightIcon, EyeIcon, PlusCircleIcon } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title: "作成済みメモ一覧 | オレの比較メモ",
    description:
      "保存済みの比較メモを確認し、編集や公開設定の変更を行う管理画面です。",
    path: "/memos",
    noIndex: true,
    siteUrl,
  });
}

function getVisibilityLabel(isPublic: boolean) {
  return isPublic ? "公開" : "非公開";
}

export default async function MemosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <Card className="border-border/80 bg-card/78">
          <CardHeader>
            <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
              my memos
            </p>
            <CardTitle className="text-2xl">作成済みメモ一覧</CardTitle>
            <CardDescription>
              自分の保存済みメモを見るには Google
              ログインが必要です。ログイン後にこの画面へ戻ると一覧が表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/memos/new">
                <PlusCircleIcon className="h-4 w-4" />
                新しいメモを作る
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                ホームへ戻る
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const memos = await listComparisonMemos(userId);
  const profile = await ensureUserProfile(userId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
            my memos
          </p>
          <h1 className="text-2xl font-semibold">作成済みメモ一覧</h1>
          <p className="text-sm text-muted-foreground">
            保存した比較メモを再開したり、公開設定を切り替えながら閲覧モードで内容を確認できます。
          </p>
        </div>
        <Button asChild>
          <Link href="/memos/new">
            <PlusCircleIcon className="h-4 w-4" />
            新しいメモを作る
          </Link>
        </Button>
      </section>

      {profile ? (
        <ProfileSettingsCard
          initialName={profile.name}
          image={profile.image}
          maxLength={USER_PROFILE_NAME_MAX_LENGTH}
        />
      ) : null}

      {memos.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">
              保存済みメモはまだありません
            </CardTitle>
            <CardDescription>
              新しい比較メモを作成して保存すると、この画面に一覧表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/memos/new">
                <PlusCircleIcon className="h-4 w-4" />
                最初のメモを作る
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {memos.map((memo) => (
            <Card key={memo.id} className="border-border/80 bg-card/72">
              <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{memo.title}</CardTitle>
                    <span className="rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {getVisibilityLabel(memo.isPublic)}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    カテゴリ: {memo.category || "未設定"}
                  </CardDescription>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {memo.isPublic
                      ? "公開中のため、他ユーザーは閲覧専用で確認できます。"
                      : "非公開のため、自分以外のユーザーには表示されません。"}
                  </p>
                </div>
                <div className="text-xs leading-6 text-muted-foreground">
                  <div>
                    作成: {new Date(memo.createdAt).toLocaleString("ja-JP")}
                  </div>
                  <div>
                    更新: {new Date(memo.updatedAt).toLocaleString("ja-JP")}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/memos/new?memoId=${memo.id}`}>
                    編集を再開
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/memos/${memo.id}`}>
                    閲覧モードで確認
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
