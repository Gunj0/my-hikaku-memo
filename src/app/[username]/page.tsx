import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { auth } from "@/auth";
import { DeleteMemoButton } from "@/components/delete-memo-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildMetadata, getRequestSiteUrl } from "@/lib/seo";
import { listComparisonMemosByUsername } from "@/lib/server/comparison-memos";
import { getUserProfileByUsername } from "@/lib/server/user-profiles";
import { getUserInitials } from "@/lib/user-display";
import { normalizeUsername } from "@/lib/username";
import {
  ArrowRightIcon,
  EyeIcon,
  PlusCircleIcon,
  SettingsIcon,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const PROFILE_INITIALS_FALLBACK = "HM";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

function getVisibilityLabel(isPublic: boolean) {
  return isPublic ? "公開" : "非公開";
}

/**
 * URL のハンドルを正規形へ解決する。
 * 大文字小文字が食い違う場合は正規形へ 308 で寄せ、canonical を一意に保つ。
 */
async function resolveProfile(requestedUsername: string) {
  const normalized = normalizeUsername(decodeURIComponent(requestedUsername));
  const profile = await getUserProfileByUsername(normalized);

  if (!profile) {
    return null;
  }

  if (normalized !== profile.username) {
    permanentRedirect(`/${profile.username}`);
  }

  return profile;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const siteUrl = await getRequestSiteUrl();
  const profile = await getUserProfileByUsername(
    normalizeUsername(decodeURIComponent(username)),
  );

  if (!profile) {
    return buildMetadata({
      title: "ユーザーが見つかりません | オレの比較メモ",
      description: "指定されたユーザーは見つかりませんでした。",
      path: `/${username}`,
      noIndex: true,
      siteUrl,
    });
  }

  // 公開メモが 1 件も無いプロフィールは薄いページになるため index させない。
  // sitemap.xml の掲載条件と一致させること。
  const publicMemos = await listComparisonMemosByUsername(profile.username);

  return buildMetadata({
    title: `${profile.name}さんの比較メモ | オレの比較メモ`,
    description: `${profile.name}さんが公開している比較メモの一覧です。`,
    path: `/${profile.username}`,
    noIndex: publicMemos.length === 0,
    siteUrl,
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await resolveProfile(username);

  if (!profile) {
    notFound();
  }

  const session = await auth();
  const viewerUserId = session?.user?.id;
  const isOwner = viewerUserId === profile.id;
  const memos = await listComparisonMemosByUsername(
    profile.username,
    viewerUserId,
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <section className="flex flex-row items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border border-border/70">
            <AvatarImage src={profile.image} alt={profile.name} />
            <AvatarFallback>
              {getUserInitials(profile.name, PROFILE_INITIALS_FALLBACK)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{profile.name}</h1>
            <p className="text-xs text-muted-foreground">/{profile.username}</p>
          </div>
        </div>
        {isOwner ? (
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="success">
              <Link href="/edit">
                <PlusCircleIcon className="h-4 w-4" />
                新しいメモを作る
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/settings">
                <SettingsIcon className="h-4 w-4" />
                アカウント設定
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      <div>
        <h2 className="text-lg font-semibold">比較メモ</h2>
      </div>

      {memos.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">
              {isOwner
                ? "保存済みメモはまだありません"
                : "公開中のメモはまだありません"}
            </CardTitle>
            <CardDescription>
              {isOwner
                ? "比較メモを保存すると、ここに一覧表示されます。"
                : "このユーザーが比較メモを公開すると、ここに表示されます。"}
            </CardDescription>
          </CardHeader>
          {isOwner ? (
            <CardContent>
              <Button asChild variant="success">
                <Link href="/edit">
                  <PlusCircleIcon className="h-4 w-4" />
                  最初のメモを作る
                </Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>
      ) : (
        <div className="grid gap-4">
          {memos.map((memo) => (
            <Card key={memo.id} className="border border-border/80 bg-card/72">
              <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{memo.title}</CardTitle>
                    {isOwner ? (
                      <span className="rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {getVisibilityLabel(memo.isPublic)}
                      </span>
                    ) : null}
                  </div>
                  <CardDescription className="mt-2">
                    カテゴリ: {memo.category || "未設定"}
                  </CardDescription>
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
                {isOwner ? (
                  <Button asChild>
                    <Link href={`/edit?memoId=${memo.id}`}>
                      編集する
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link href={`/${profile.username}/${memo.id}`}>
                    閲覧モードで確認
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </Button>
                {isOwner ? (
                  <DeleteMemoButton memoId={memo.id} memoTitle={memo.title} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
