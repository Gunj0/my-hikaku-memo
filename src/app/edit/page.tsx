import { auth } from "@/auth";
import { GadgetComparison } from "@/components/gadget-comparison";
import { buildMetadata, getRequestSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title: "新しい比較メモを作成 | オレの比較メモ",
    description: "ガジェットや家電の新しい比較メモを作成する画面です。",
    path: "/edit",
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
  const session = await auth();
  const { memoId } = await searchParams;
  const initialMemoId = Array.isArray(memoId) ? memoId[0] : memoId;

  if (!session?.user?.id && initialMemoId) {
    redirect("/edit");
  }

  return <GadgetComparison initialMemoId={initialMemoId} />;
}
