"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMPARISON_MEMO_TEXT_MAX_LENGTH } from "@/lib/comparison-limits";
import { DecisionPoint, Product, ProductScore } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, PartyPopperIcon, TrophyIcon } from "lucide-react";

interface DecisionStepProps {
  products: Product[];
  decisionPoints: DecisionPoint[];
  scores: ProductScore[];
  selectedProductId: string | null;
  decisionMemo: string;
  onSelectProduct: (id: string | null) => void;
  onMemoChange: (memo: string) => void;
}

interface ProductTotal {
  product: Product;
  totalScore: number;
  maxPossible: number;
  percentage: number;
}

export function DecisionStep({
  products,
  decisionPoints,
  scores,
  selectedProductId,
  decisionMemo,
  onSelectProduct,
  onMemoChange,
}: DecisionStepProps) {
  const getScore = (productId: string, pointId: string): number => {
    return (
      scores.find((s) => s.productId === productId && s.pointId === pointId)
        ?.score || 0
    );
  };

  const calculateProductTotal = (product: Product): ProductTotal => {
    let totalScore = 0;
    let maxPossible = 0;

    decisionPoints.forEach((point) => {
      const rawScore = getScore(product.id, point.id);
      totalScore += rawScore * point.weight;
      maxPossible += 5 * point.weight;
    });

    return {
      product,
      totalScore,
      maxPossible,
      percentage: maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0,
    };
  };

  const productTotals = products
    .map(calculateProductTotal)
    .sort((a, b) => b.totalScore - a.totalScore);

  const topScore = productTotals[0]?.totalScore || 0;
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  if (products.length === 0) {
    return (
      <div className="space-y-6 mx-auto max-w-6xl">
        <div>
          <h2 className="text-xl font-semibold mb-2">最終決定</h2>
          <p className="text-muted-foreground text-sm">
            候補を先に追加してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">最終決定</h2>
        <p className="text-muted-foreground text-sm">
          評価結果をふまえて、最終候補を決定しましょう
        </p>
      </div>

      {selectedProduct && (
        <div className="p-6 bg-success/10 border border-success/40 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <PartyPopperIcon className="w-8 h-8 text-success" />
            <div>
              <p className="text-sm text-success">決定</p>
              <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectProduct(null)}
          >
            選択を解除
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <Label>製品を選択</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {productTotals.map(({ product, totalScore, percentage }, index) => (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all",
                selectedProductId === product.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                    index === 0 && topScore > 0
                      ? "bg-success text-success-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {index === 0 && topScore > 0 ? (
                    <TrophyIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    {selectedProductId === product.id && (
                      <CheckCircle2Icon className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalScore} pt ({percentage.toFixed(0)}%)
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="decision-memo">決定理由・メモ</Label>
        <Textarea
          id="decision-memo"
          placeholder="この製品を選んだ理由、購入予定日、注意点など..."
          value={decisionMemo}
          onChange={(e) => onMemoChange(e.target.value)}
          maxLength={COMPARISON_MEMO_TEXT_MAX_LENGTH}
          className="min-h-37.5 resize-none border-foreground/20"
        />
      </div>
    </div>
  );
}
