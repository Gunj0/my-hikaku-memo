import type { Metadata } from "next";

import { GadgetComparison } from "@/components/gadget-comparison";
import { buildPageMetadata } from "@/lib/seo";

type NewMemoPageProps = {
  searchParams: Promise<{
    memoId?: string | string[];
  }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "新しい比較メモを作る",
  description:
    "比較ポイント・候補製品・評価・最終判断を整理して自分用の比較メモを作成する画面です。",
  path: "/memos/new",
  index: false,
});

export default async function NewMemoPage({ searchParams }: NewMemoPageProps) {
  const { memoId } = await searchParams;
  const initialMemoId = Array.isArray(memoId) ? memoId[0] : memoId;

  return <GadgetComparison initialMemoId={initialMemoId} />;
}
