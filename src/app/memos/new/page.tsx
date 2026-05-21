import { GadgetComparison } from "@/components/gadget-comparison";

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
