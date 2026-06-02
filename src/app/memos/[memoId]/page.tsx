import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ComparisonMemoView } from "@/components/comparison-memo-view";
import { Button } from "@/components/ui/button";
import {
  buildArticleJsonLd,
  buildMetadata,
  getAbsoluteUrl,
  getRequestSiteUrl,
} from "@/lib/seo";
import { getPublicComparisonMemo } from "@/lib/server/comparison-memos";
import { ArrowRightIcon, PencilIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type MemoDetailPageProps = {
  params: Promise<{
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

export async function generateMetadata({
  params,
}: MemoDetailPageProps): Promise<Metadata> {
  const { memoId } = await params;
  const session = await auth();
  const memo = await getPublicComparisonMemo(memoId, session?.user?.id);
  const siteUrl = await getRequestSiteUrl();

  if (!memo) {
    return buildMetadata({
      title: "比較メモが見つかりません | オレの比較メモ",
      description: "指定された比較メモは見つからないか、閲覧できません。",
      path: `/memos/${memoId}`,
      noIndex: true,
      siteUrl,
    });
  }

  return buildMetadata({
    title: `${memo.title} | オレの比較メモ`,
    description: buildMemoDescription(
      memo.title,
      memo.category,
      getAuthorNameLabel(memo.author.name),
    ),
    path: `/memos/${memo.id}`,
    image: getAbsoluteUrl(`/memos/${memo.id}/opengraph-image`, siteUrl),
    type: "article",
    publishedTime: memo.createdAt,
    modifiedTime: memo.updatedAt,
    noIndex: !memo.isPublic,
    siteUrl,
  });
}

export default async function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { memoId } = await params;
  const session = await auth();
  const memo = await getPublicComparisonMemo(memoId, session?.user?.id);
  const siteUrl = await getRequestSiteUrl();

  if (!memo) {
    notFound();
  }

  const articleJsonLd = buildArticleJsonLd({
    title: memo.title,
    description: buildMemoDescription(
      memo.title,
      memo.category,
      getAuthorNameLabel(memo.author.name),
    ),
    path: `/memos/${memo.id}`,
    image: getAbsoluteUrl(`/memos/${memo.id}/opengraph-image`, siteUrl),
    publishedTime: memo.createdAt,
    modifiedTime: memo.updatedAt,
    authorName: getAuthorNameLabel(memo.author.name),
    siteUrl,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      {memo.isPublic ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd),
          }}
        />
      ) : null}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
            memo viewer
          </p>
          <h1 className="text-2xl font-semibold">比較メモの閲覧</h1>
          <p className="text-sm text-muted-foreground">
            {memo.isPublic ? "この画面は閲覧専用です" : "このメモは非公開です"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {memo.isOwner ? (
            <Button asChild>
              <Link href={`/memos/new?memoId=${memo.id}`}>
                <PencilIcon className="h-4 w-4" />
                編集する
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/memos">
              一覧へ戻る
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <ComparisonMemoView memo={memo} />
    </main>
  );
}
