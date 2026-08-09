import type { DecisionPoint, Product, ProductScore } from "@/lib/types";

/** 1 評価あたりの満点（評価点は 0-5）。 */
export const MAX_PRODUCT_SCORE = 5;

export interface ProductTotal {
  product: Product;
  totalScore: number;
  maxPossible: number;
  percentage: number;
}

/**
 * 指定した候補 × 比較ポイントの評価点を返す。未評価は 0。
 */
export function getProductPointScore(
  scores: ProductScore[],
  productId: string,
  pointId: string,
): number {
  return (
    scores.find(
      (score) => score.productId === productId && score.pointId === pointId,
    )?.score ?? 0
  );
}

/**
 * 候補の加重合計点 Σ(score × weight)。未評価ポイントは 0 点として加算する。
 */
export function getProductTotalScore(
  scores: ProductScore[],
  decisionPoints: DecisionPoint[],
  productId: string,
): number {
  return decisionPoints.reduce(
    (total, point) =>
      total + getProductPointScore(scores, productId, point.id) * point.weight,
    0,
  );
}

/**
 * 満点 Σ(5 × weight)。比較ポイントが無い場合は 0。
 */
export function getMaxPossibleScore(decisionPoints: DecisionPoint[]): number {
  return decisionPoints.reduce(
    (total, point) => total + MAX_PRODUCT_SCORE * point.weight,
    0,
  );
}

/**
 * 1 候補分の集計（加重合計点・満点・達成率）。
 * 満点が 0（比較ポイント無し）のときは達成率 0% とする。
 */
export function calculateProductTotal(
  product: Product,
  decisionPoints: DecisionPoint[],
  scores: ProductScore[],
): ProductTotal {
  const totalScore = getProductTotalScore(scores, decisionPoints, product.id);
  const maxPossible = getMaxPossibleScore(decisionPoints);

  return {
    product,
    totalScore,
    maxPossible,
    percentage: maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0,
  };
}

/**
 * 全候補を集計し、加重合計点の降順で並べ替えて返す。
 * 同点は入力順を維持する（Array.prototype.sort の安定性に依存）。
 */
export function rankProductTotals(
  products: Product[],
  decisionPoints: DecisionPoint[],
  scores: ProductScore[],
): ProductTotal[] {
  return products
    .map((product) => calculateProductTotal(product, decisionPoints, scores))
    .sort((left, right) => right.totalScore - left.totalScore);
}

/**
 * 集計済みリストの最高得点。空なら 0。
 */
export function getTopTotalScore(totals: ProductTotal[]): number {
  return totals[0]?.totalScore ?? 0;
}
