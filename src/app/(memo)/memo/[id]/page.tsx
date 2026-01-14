"use client";

import AuthGuard from "@/components/auth/auth-guard";
import CreateHeader from "@/components/common/create-header";
import HikakuForm from "@/components/memo/hikaku-form";
import HikakuTable from "@/components/memo/hikaku-table";
import { Button } from "@/components/ui/button";
import PATH from "@/const/Path";
import type { Evaluation, Point, Product } from "@/types/memo";
import { Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type ResponseData = {
  points: Point[];
  products: Product[];
  error?: string;
};

export default function EditMemoPage() {
  // クエリパラメータのmemoId取得
  const params = useParams();
  const memoId = params.id as string;
  // 製品ジャンル
  const [categories, setCategories] = useState<string[]>([""]);
  // 比較ポイント
  const [points, setPoints] = useState<Point[]>([]);
  // 候補製品
  const [products, setProducts] = useState<Product[]>([]);
  // 評価
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  // 選択した製品ID
  const [selectedProductId, setSelectedProductId] = useState<string>();
  // 最終決定理由
  const [finalDecisionReason, setFinalDecisionReason] = useState("");
  // AIロード中
  const [isAILoading, setIsAILoading] = useState(false);
  // ルータ
  const router = useRouter();

  const handleSave = () => {
    // if (!category.trim()) {
    //   alert("製品ジャンルを入力してください");
    //   return;
    // }

    // const memo = {
    //   id: memoId,
    //   userId,
    //   category,
    //   comparisonPoints,
    //   products,
    //   evaluations,
    //   selectedProductId,
    //   finalDecisionReason,
    //   createdAt: getMemoByMemoId(memoId)?.createdAt || new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // };

    // saveMemo(memo);
    router.push(PATH.MEMO.LIST);
  };

  const handleAISuggestPoints = async () => {
    // if (!category.trim()) {
    //   alert("先に製品ジャンルを入力してください");
    //   return;
    // }
    // setIsAILoading(true);
    // try {
    //   const response = await fetch("/api/ai/suggest-points", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ category }),
    //   });
    //   const data: ResponseData = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.error || "AI提案の取得に失敗しました");
    //   }
    //   const newPoints: ComparisonPoint[] = data.points.map((name: string) => ({
    //     id: crypto.randomUUID(),
    //     name,
    //     isImportant: false,
    //   }));
    //   setComparisonPoints([...comparisonPoints, ...newPoints]);
    // } catch (error) {
    //   console.error("[v0] AI suggest points error:", error);
    //   alert(
    //     error instanceof Error ? error.message : "AI提案の取得に失敗しました"
    //   );
    // } finally {
    //   setIsAILoading(false);
    // }
  };

  const handleAISuggestProducts = async () => {
    // if (!category.trim()) {
    //   alert("先に製品ジャンルを入力してください");
    //   return;
    // }
    // setIsAILoading(true);
    // try {
    //   const response = await fetch("/api/ai/suggest-products", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ category }),
    //   });
    //   const data: ResponseData = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.error || "AI提案の取得に失敗しました");
    //   }
    //   const newProducts: Product[] = data.products.map((name: string) => ({
    //     id: crypto.randomUUID(),
    //     name,
    //   }));
    //   setProducts([...products, ...newProducts]);
    // } catch (error) {
    //   console.error("[v0] AI suggest products error:", error);
    //   alert(
    //     error instanceof Error ? error.message : "AI提案の取得に失敗しました"
    //   );
    // } finally {
    //   setIsAILoading(false);
    // }
  };

  return (
    <AuthGuard>
      <CreateHeader />
      <div className="bg-linear-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          {/* ヘッダ */}
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-xl font-bold">比較メモ編集</h1>
            <Button className="cursor-pointer" onClick={handleSave}>
              <Save className="h-4 w-4" />
              <p>保存</p>
            </Button>
          </div>

          {/* Form */}
          <HikakuForm
            title=""
            onTitleChange={() => {}}
            categories={categories}
            onCategoriesChange={setCategories}
            points={points}
            onPointsChange={setPoints}
            products={products}
            onProductsChange={setProducts}
            onAISuggestPoints={handleAISuggestPoints}
            onAISuggestProducts={handleAISuggestProducts}
            isAILoading={isAILoading}
          />

          {/* Comparison Table */}
          <div className="mt-8">
            <HikakuTable
              comparisonPoints={points}
              products={products}
              evaluations={evaluations}
              onEvaluationsChange={setEvaluations}
              selectedProductId={selectedProductId}
              onSelectedProductChange={setSelectedProductId}
              finalDecisionReason={finalDecisionReason}
              onFinalDecisionReasonChange={setFinalDecisionReason}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
