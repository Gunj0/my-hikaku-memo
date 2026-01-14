"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Evaluation, Point, Product } from "@/types/memo";
import { ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

interface HikakuTableProps {
  comparisonPoints: Point[];
  products: Product[];
  evaluations: Evaluation[];
  onEvaluationsChange: (evaluations: Evaluation[]) => void;
  selectedProductId?: string;
  onSelectedProductChange: (productId: string) => void;
  finalDecisionReason: string;
  onFinalDecisionReasonChange: (reason: string) => void;
}

export function HikakuTable({
  comparisonPoints,
  products,
  evaluations,
  onEvaluationsChange,
  selectedProductId,
  onSelectedProductChange,
  finalDecisionReason,
  onFinalDecisionReasonChange,
}: HikakuTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const getEvaluation = (productId: string, pointId: string): Evaluation => {
    return (
      evaluations.find(
        (e) => e.productId === productId && e.pointId === pointId
      ) || {
        productId,
        pointId,
        memo: "",
      }
    );
  };

  const updateEvaluation = (
    productId: string,
    pointId: string,
    updates: Partial<Evaluation>
  ) => {
    const existingIndex = evaluations.findIndex(
      (e) => e.productId === productId && e.pointId === pointId
    );

    if (existingIndex >= 0) {
      const newEvaluations = [...evaluations];
      newEvaluations[existingIndex] = {
        ...newEvaluations[existingIndex],
        ...updates,
      };
      onEvaluationsChange(newEvaluations);
    } else {
      onEvaluationsChange([
        ...evaluations,
        { productId, pointId, memo: "", ...updates },
      ]);
    }
  };

  const calculateTotalScore = (productId: string): number => {
    return comparisonPoints.reduce((total, point) => {
      const evaluation = getEvaluation(productId, point.id ?? "");
      return total + (evaluation.rating || 0);
    }, 0);
  };

  if (
    !products ||
    products.length === 0 ||
    !comparisonPoints ||
    comparisonPoints.length === 0
  ) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center text-center pt-6">
          <div>
            <p className="text-muted-foreground">
              比較表を表示するには、比較ポイントと候補製品を追加してください
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison Grid - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle>比較表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-muted p-3 text-left text-sm font-semibold border-b border-r min-w-[120px]">
                    製品名
                  </th>
                  {comparisonPoints.map((point) => (
                    <th
                      key={point.id}
                      className="bg-muted p-3 text-left text-sm font-semibold border-b min-w-[200px]"
                    >
                      <div className="flex items-center gap-2">
                        {point.name}
                        {point.isImportant && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded whitespace-nowrap">
                            重視
                          </span>
                        )}
                      </div>
                      {point.constraint && (
                        <div className="text-xs text-muted-foreground font-normal mt-1">
                          制約: {point.constraint}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={`${
                      selectedProductId === product.id ? "bg-primary/5" : ""
                    } hover:bg-muted/50 transition-colors`}
                  >
                    <td className="sticky left-0 z-10 bg-background p-3 border-b border-r font-medium">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {selectedProductId === product.id && (
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </td>
                    {comparisonPoints.map((point) => {
                      const evaluation = getEvaluation(
                        product.id ?? "",
                        point.id ?? ""
                      );
                      const cellId = `${product.id}-${point.id}`;
                      const isEditing = editingCell === cellId;

                      return (
                        <td key={point.id} className="p-3 border-b align-top">
                          <div className="space-y-2">
                            {/* 星評価 */}
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    updateEvaluation(
                                      product.id ?? "",
                                      point.id ?? "",
                                      {
                                        rating: star,
                                      }
                                    )
                                  }
                                  className="transition-colors"
                                  type="button"
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      evaluation.rating &&
                                      evaluation.rating >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* メモ入力 */}
                            {isEditing ? (
                              <Textarea
                                placeholder="評価やメモを入力..."
                                value={evaluation.memo}
                                onChange={(e) =>
                                  updateEvaluation(
                                    product.id ?? "",
                                    point.id ?? "",
                                    {
                                      memo: e.target.value,
                                    }
                                  )
                                }
                                onBlur={() => setEditingCell(null)}
                                autoFocus
                                className="min-h-[80px] text-sm"
                              />
                            ) : (
                              <div
                                onClick={() => setEditingCell(cellId)}
                                className="min-h-[60px] cursor-pointer rounded border border-dashed bg-background px-2 py-2 text-sm text-muted-foreground hover:border-solid"
                              >
                                {evaluation.memo || "クリックして入力..."}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-muted/50 font-semibold">
                  <td className="sticky left-0 z-10 bg-muted p-3 border-t-2 border-r">
                    総合評価
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-3 border-t-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">
                          {calculateTotalScore(product.id ?? "")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {comparisonPoints.length * 5}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Decision */}
      <Card>
        <CardHeader>
          <CardTitle>購入決定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              購入する製品を選択
            </Label>
            <RadioGroup
              value={selectedProductId}
              onValueChange={onSelectedProductChange}
            >
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={product.id ?? ""}
                      id={`select-${product.id ?? ""}`}
                    />
                    <Label
                      htmlFor={`select-${product.id ?? ""}`}
                      className="cursor-pointer"
                    >
                      {product.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label
              htmlFor="final-reason"
              className="text-sm font-medium mb-2 block"
            >
              購入決定理由・総評
            </Label>
            <Textarea
              id="final-reason"
              placeholder="最終的にこの製品を選んだ理由や、比較検討の総評を記入..."
              value={finalDecisionReason}
              onChange={(e) => onFinalDecisionReasonChange(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
