"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DecisionPoint, Product, ProductScore } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StarIcon, TrendingUpIcon, TrophyIcon } from "lucide-react";

interface SummaryStepProps {
  products: Product[];
  decisionPoints: DecisionPoint[];
  scores: ProductScore[];
}

interface ProductTotal {
  product: Product;
  totalScore: number;
  maxPossible: number;
  percentage: number;
}

export function SummaryStep({
  products,
  decisionPoints,
  scores,
}: SummaryStepProps) {
  const importantPoints = decisionPoints.filter((p) => p.isImportant);

  const getScore = (productId: string, pointId: string): number => {
    return (
      scores.find((s) => s.productId === productId && s.pointId === pointId)
        ?.score || 0
    );
  };

  const calculateWeightedScore = (
    productId: string,
    point: DecisionPoint,
  ): number => {
    const rawScore = getScore(productId, point.id);
    return rawScore * point.weight;
  };

  const calculateProductTotal = (product: Product): ProductTotal => {
    let totalScore = 0;
    let maxPossible = 0;

    importantPoints.forEach((point) => {
      totalScore += calculateWeightedScore(product.id, point);
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

  if (products.length === 0 || importantPoints.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">集計結果</h2>
          <p className="text-muted-foreground text-sm">
            製品と評価を先に入力してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">集計結果</h2>
        <p className="text-muted-foreground text-sm">
          重要度を加味した評点の合計です
        </p>
      </div>

      {/* Ranking cards */}
      <div className="space-y-3">
        {productTotals.map((item, index) => (
          <div
            key={item.product.id}
            className={cn(
              "p-4 rounded-lg border transition-all",
              index === 0 && topScore > 0
                ? "border-success/40 bg-success/10"
                : "border-border bg-card/80",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  index === 0 && topScore > 0
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {index === 0 && topScore > 0 ? (
                  <TrophyIcon className="w-5 h-5" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{item.product.name}</h3>
                  {index === 0 && topScore > 0 && (
                    <span className="text-xs bg-success text-success-foreground px-2 py-0.5 rounded-full">
                      最高評価
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {item.totalScore} / {item.maxPossible} pt
                    </span>
                    <span className="font-medium">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        index === 0 && topScore > 0
                          ? "bg-success"
                          : "bg-muted-foreground/50",
                      )}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">ポイント</TableHead>
              <TableHead className="text-center w-20">重要度</TableHead>
              {productTotals.map(({ product }) => (
                <TableHead
                  key={product.id}
                  className="text-center min-w-[100px]"
                >
                  {product.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {importantPoints.map((point) => (
              <TableRow key={point.id}>
                <TableCell className="font-medium">{point.name}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <StarIcon className="w-4 h-4 fill-primary" />
                    {point.weight}
                  </span>
                </TableCell>
                {productTotals.map(({ product }) => {
                  const raw = getScore(product.id, point.id);
                  const weighted = calculateWeightedScore(product.id, point);
                  return (
                    <TableCell key={product.id} className="text-center">
                      <div className="text-sm">
                        <span className="font-medium">{weighted}</span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({raw}×{point.weight})
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">合計</TableCell>
              <TableCell />
              {productTotals.map(({ product, totalScore }) => (
                <TableCell key={product.id} className="text-center">
                  <span className="font-bold text-lg">{totalScore}</span>
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <div className="flex items-start gap-3">
          <TrendingUpIcon className="w-5 h-5 text-success mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>スコアは「評価点 × 重要度」の合計で計算されています。</p>
            <p className="mt-1">
              最高スコアの製品が最もあなたの重視ポイントにマッチしています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
