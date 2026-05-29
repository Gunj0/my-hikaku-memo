import { GadgetComparison } from "@/components/gadget-comparison";
import { buildMetadata, getRequestSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title: "新しい比較メモを作成 | オレの比較メモ",
    description:
      "比較対象、重視ポイント、評価を入力して新しい比較メモを作成する画面です。",
    path: "/memos/new",
    noIndex: true,
    siteUrl,
  });
}

type NewMemoPageProps = {
  searchParams: Promise<{
    memoId?: string | string[];
  }>;
};

export default async function NewMemoPage({ searchParams }: NewMemoPageProps) {
  const { memoId } = await searchParams;
  const initialMemoId = Array.isArray(memoId) ? memoId[0] : memoId;

  return <GadgetComparison initialMemoId={initialMemoId} />;
}
