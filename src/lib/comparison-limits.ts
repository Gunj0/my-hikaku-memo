import type { ComparisonData } from "@/lib/types";

export const COMPARISON_ID_MAX_LENGTH = 128;
export const COMPARISON_SHORT_TEXT_MAX_LENGTH = 120;
export const COMPARISON_MEMO_TEXT_MAX_LENGTH = 5_000;
export const COMPARISON_DECISION_POINTS_MAX_COUNT = 30;
export const COMPARISON_PRODUCTS_MAX_COUNT = 30;
export const COMPARISON_SCORES_MAX_COUNT =
  COMPARISON_DECISION_POINTS_MAX_COUNT * COMPARISON_PRODUCTS_MAX_COUNT;

export function clampComparisonShortText(value: string) {
  return value.slice(0, COMPARISON_SHORT_TEXT_MAX_LENGTH);
}

export function clampComparisonMemoText(value: string) {
  return value.slice(0, COMPARISON_MEMO_TEXT_MAX_LENGTH);
}

export function normalizeComparisonDataToLimits(
  data: ComparisonData,
): ComparisonData {
  const decisionPoints = data.decisionPoints
    .slice(0, COMPARISON_DECISION_POINTS_MAX_COUNT)
    .map((point) => ({
      ...point,
      name: clampComparisonShortText(point.name),
      memo: clampComparisonMemoText(point.memo),
    }));

  const products = data.products
    .slice(0, COMPARISON_PRODUCTS_MAX_COUNT)
    .map((product) => ({
      ...product,
      name: clampComparisonShortText(product.name),
      memo: clampComparisonMemoText(product.memo),
    }));

  const allowedPointIds = new Set(decisionPoints.map((point) => point.id));
  const allowedProductIds = new Set(products.map((product) => product.id));

  const scores = data.scores
    .filter(
      (score) =>
        allowedProductIds.has(score.productId) &&
        allowedPointIds.has(score.pointId),
    )
    .slice(0, COMPARISON_SCORES_MAX_COUNT)
    .map((score) => ({
      ...score,
      memo: clampComparisonMemoText(score.memo),
    }));

  return {
    category: clampComparisonShortText(data.category),
    categoryMemo: clampComparisonMemoText(data.categoryMemo),
    decisionPoints,
    pointsMemo: clampComparisonMemoText(data.pointsMemo),
    products,
    productsMemo: clampComparisonMemoText(data.productsMemo),
    scores,
    selectedProductId:
      data.selectedProductId && allowedProductIds.has(data.selectedProductId)
        ? data.selectedProductId
        : null,
    decisionMemo: clampComparisonMemoText(data.decisionMemo),
  };
}
