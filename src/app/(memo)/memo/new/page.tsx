"use client";

import AuthGuard from "@/components/auth/auth-guard";
import CreateHeader from "@/components/common/create-header";
import { HikakuForm } from "@/components/memo/hikaku-form";
import { HikakuTable } from "@/components/memo/hikaku-table";
import { Button } from "@/components/ui/button";
import { PATH } from "@/const/Path";
import { createMemo } from "@/lib/post-memo";
import type {
  Evaluation,
  HikakuMemoCreateRequest,
  Point,
  Product,
} from "@/types/memo";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMemoPage() {
  return (
    <AuthGuard>
      <CreateHeader />
      <NewMemoContent />
    </AuthGuard>
  );
}

function NewMemoContent() {
  // 製品ジャンル
  const [categories, setCategories] = useState<string[]>([""]);
  // 比較ポイント
  const [points, setPoints] = useState<Point[]>([]);
  // 候補製品
  const [products, setProducts] = useState<Product[]>([]);
  // AI提案中
  const [isAILoading, setIsAILoading] = useState(false);
  // 評価
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  // 選択した製品ID
  const [selectedProductId, setSelectedProductId] = useState<string>();
  // 最終決定理由
  const [finalDecisionReason, setFinalDecisionReason] = useState("");
  // タイトル
  const [title, setTitle] = useState("");
  // ルータ
  const router = useRouter();

  // AI提案で比較ポイントを追加
  const handleAISuggestPoints = async () => {
    setIsAILoading(true);
    try {
      const response = await fetch(PATH.API.AI.SUGGEST_POINTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: categories }),
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
      // 元の比較ポイントリストに追加
      setPoints([...points, ...newPoints]);
    } catch (error) {
      console.error("AI提案の取得に失敗しました:", error);
      alert(
        error instanceof Error ? error.message : "AI提案の取得に失敗しました"
      );
    } finally {
      setIsAILoading(false);
    }
  };

  // AI提案で候補製品を追加
  const handleAISuggestProducts = async () => {
    setIsAILoading(true);
    try {
      const response = await fetch(PATH.API.AI.SUGGEST_PRODUCTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: categories }),
      });

      type ResponseData = {
        products: string[];
        error?: string;
      };
      const data: ResponseData = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI提案の取得に失敗しました");
      }

      const newProducts: Product[] = data.products.map((name: string) => ({
        id: crypto.randomUUID(),
        name,
        isSelected: false,
      }));
      // 元の製品リストに追加
      setProducts([...products, ...newProducts]);
    } catch (error) {
      console.error("[v0] AI suggest products error:", error);
      alert(
        error instanceof Error ? error.message : "AI提案の取得に失敗しました"
      );
    } finally {
      setIsAILoading(false);
    }
  };

  // 保存処理
  const handleSave = async () => {
    const memo: HikakuMemoCreateRequest = {
      title: title,
      categories: categories,
      points: points,
      products,
      evaluations,
      selectedProductId,
      finalDecisionReason,
    };

    await createMemo(memo);
    router.push(PATH.MEMO.LIST);
  };

  return (
    <div className="bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto p-4">
        {/* ヘッダ */}
        <h1 className="mb-2 text-xl text-gray-600 font-bold">新規比較メモ</h1>

        {/* 比較入力 */}
        <HikakuForm
          title={title}
          onTitleChange={setTitle}
          categories={categories}
          onCategoriesChange={setCategories}
          points={points}
          onPointsChange={setPoints}
          products={products}
          onProductsChange={setProducts}
          isAILoading={isAILoading}
          onAISuggestPoints={handleAISuggestPoints}
          onAISuggestProducts={handleAISuggestProducts}
        />

        {/* 比較表 */}
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

        {/* 保存 */}
        <div className="flex items-center justify-end my-2">
          <Button className="cursor-pointer" onClick={handleSave}>
            <Save className="h-4 w-4" />
            <p>保存</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
