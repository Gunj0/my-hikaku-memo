import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { auth } from "@/auth";
import { ComparisonMemoView } from "@/components/comparison-memo-view";
import { Button } from "@/components/ui/button";
import {
  buildArticleJsonLd,
  buildMetadata,
  getAbsoluteUrl,
  getRequestSiteUrl,
  serializeJsonLd,
} from "@/lib/seo";
import { getPublicComparisonMemo } from "@/lib/server/comparison-memos";
import { normalizeUsername } from "@/lib/username";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type MemoDetailPageProps = {
  params: Promise<{
    username: string;
    memoId: string;
  }>;
};

function buildMemoDescription(
  title: string,
  category: string,
  authorName: string,
) {
  const categoryLabel = category || "未設定";

  return `${authorName}が作成した「${title}」の比較メモです。カテゴリは${categoryLabel}。比較ポイントや最終判断を閲覧できます。`;
}

function getAuthorNameLabel(name: string | null) {
  return name?.trim() || "匿名ユーザー";
}

/**
 * memoId はグローバル一意なので、URL の username が古くてもメモは引ける。
 * その場合は所有者の現在のハンドルへ 308 で寄せる。
 * これにより username 変更後も既存のメモ URL が切れない。
 */
function assertCanonicalUsername(
  requestedUsername: string,
  authorUsername: string,
  memoId: string,
): void {
  if (normalizeUsername(decodeURIComponent(requestedUsername)) !== authorUsername) {
    permanentRedirect(`/${authorUsername}/${memoId}`);
  }
}

export async function generateMetadata({
  params,
}: MemoDetailPageProps): Promise<Metadata> {
  const { username, memoId } = await params;
  const session = await auth();
  const memo = await getPublicComparisonMemo(memoId, session?.user?.id);
  const siteUrl = await getRequestSiteUrl();

  if (!memo) {
    return buildMetadata({
      title: "比較メモが見つかりません | オレの比較メモ",
      description: "指定された比較メモは見つからないか、閲覧できません。",
      path: `/${username}/${memoId}`,
      noIndex: true,
      siteUrl,
    });
  }

  const canonicalPath = `/${memo.author.username}/${memo.id}`;

  return buildMetadata({
    title: `${memo.title} | オレの比較メモ`,
    description: buildMemoDescription(
      memo.title,
      memo.category,
      getAuthorNameLabel(memo.author.name),
    ),
    path: canonicalPath,
    image: getAbsoluteUrl(`${canonicalPath}/opengraph-image`, siteUrl),
    type: "article",
    publishedTime: memo.createdAt,
    modifiedTime: memo.updatedAt,
    noIndex: !memo.isPublic,
    siteUrl,
  });
}

export default async function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { username, memoId } = await params;
  const session = await auth();
  const memo = await getPublicComparisonMemo(memoId, session?.user?.id);
  const siteUrl = await getRequestSiteUrl();

  if (!memo) {
    notFound();
  }

  assertCanonicalUsername(username, memo.author.username, memo.id);

  const canonicalPath = `/${memo.author.username}/${memo.id}`;
  const articleJsonLd = buildArticleJsonLd({
    title: memo.title,
    description: buildMemoDescription(
      memo.title,
      memo.category,
      getAuthorNameLabel(memo.author.name),
    ),
    path: canonicalPath,
    image: getAbsoluteUrl(`${canonicalPath}/opengraph-image`, siteUrl),
    publishedTime: memo.createdAt,
    modifiedTime: memo.updatedAt,
    authorName: getAuthorNameLabel(memo.author.name),
    siteUrl,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-3">
      {memo.isPublic ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(articleJsonLd),
          }}
        />
      ) : null}
      <section className="flex flex-col gap-3 justify-between">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <Button asChild variant="ghost" size="default">
            <Link href={`/${memo.author.username}`}>
              <ArrowLeftIcon className="h-4 w-4" />
              メモ一覧
            </Link>
          </Button>
          {memo.isOwner ? (
            <Button asChild>
              <Link href={`/edit?memoId=${memo.id}`}>
                <PencilIcon className="h-4 w-4" />
                編集する
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <ComparisonMemoView memo={memo} />
    </main>
  );
}
