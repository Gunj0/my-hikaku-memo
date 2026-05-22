import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ComparisonMemoView } from "@/components/comparison-memo-view";
import { Button } from "@/components/ui/button";
import { getPublicComparisonMemo } from "@/lib/server/comparison-memos";
import { ArrowRightIcon, PencilIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type MemoDetailPageProps = {
  params: Promise<{
    memoId: string;
  }>;
};

export default async function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { memoId } = await params;
  const session = await auth();
  const memo = await getPublicComparisonMemo(memoId, session?.user?.id);

  if (!memo) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
            memo viewer
          </p>
          <h1 className="text-2xl font-semibold">比較メモの閲覧</h1>
          <p className="text-sm text-muted-foreground">
            {memo.isPublic
              ? "この画面は閲覧専用です。編集は所有者だけが編集ルートから再開できます。"
              : "このメモは非公開です。所有者だけが閲覧と編集再開を行えます。"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {memo.isOwner ? (
            <Button asChild>
              <Link href={`/memos/new?memoId=${memo.id}`}>
                <PencilIcon className="h-4 w-4" />
                編集を再開
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
