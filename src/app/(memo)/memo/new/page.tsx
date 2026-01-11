"use client";

import AuthGuard from "@/components/auth/auth-guard";
import LoginHeader from "@/components/common/login-header";
import { ComparisonForm } from "@/components/memo/comparison-form";
import { ComparisonTable } from "@/components/memo/comparison-table";
import { Button } from "@/components/ui/button";
import { PATH } from "@/const/Path";
import type { Evaluation, Point, Product } from "@/types/memo";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMemoPage() {
  return (
    <AuthGuard>
      <LoginHeader />
      <NewMemoContent />
    </AuthGuard>
  );
}

function NewMemoContent() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [comparisonPoints, setComparisonPoints] = useState<Point[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const [finalDecisionReason, setFinalDecisionReason] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  const handleSave = () => {
    // if (!category.trim()) {
    //   alert("製品ジャンルを入力してください");
    //   return;
    // }

    // if (!user) {
    //   alert("ユーザー情報の取得に失敗しました");
    //   return;
    // }

    // const memo = {
    //   id: crypto.randomUUID(),
    //   userId: user.id,
    //   category,
    //   comparisonPoints,
    //   products,
    //   evaluations,
    //   selectedProductId,
    //   finalDecisionReason,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // };

    // saveMemo(memo);
    router.push(PATH.MEMO.LIST);
  };

  const handleAISuggestPoints = async () => {
    if (!category.trim()) {
      alert("先に製品ジャンルを入力してください");
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch("/api/ai/suggest-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      type ResponseData = {
        points: string[];
        error?: string;
      };
      const data: ResponseData = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI提案の取得に失敗しました");
      }

      const newPoints: Point[] = data.points.map((name: string) => ({
        id: crypto.randomUUID(),
        name,
        isImportant: false,
      }));

      setComparisonPoints([...comparisonPoints, ...newPoints]);
    } catch (error) {
      console.error("[v0] AI suggest points error:", error);
      alert(
        error instanceof Error ? error.message : "AI提案の取得に失敗しました"
      );
    } finally {
      setIsAILoading(false);
    }
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
    //   const data = await response.json();
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {/* ヘッダ */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="mb-8 text-xl font-bold">新規比較メモ</h1>
          <Button className="cursor-pointer" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            <p>保存</p>
          </Button>
        </div>

        {/* 比較入力 */}
        <ComparisonForm
          category={category}
          onCategoryChange={setCategory}
          comparisonPoints={comparisonPoints}
          onComparisonPointsChange={setComparisonPoints}
          products={products}
          onProductsChange={setProducts}
          onAISuggestPoints={handleAISuggestPoints}
          onAISuggestProducts={handleAISuggestProducts}
          isAILoading={isAILoading}
        />

        {/* 比較表 */}
        <div className="mt-8">
          <ComparisonTable
            comparisonPoints={comparisonPoints}
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
  );
}
