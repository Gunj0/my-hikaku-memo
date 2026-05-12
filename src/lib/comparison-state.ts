import type { ComparisonData, DecisionPoint } from "@/lib/types";
import { DEFAULT_DECISION_POINTS } from "@/lib/types";

function createDecisionPoints(): DecisionPoint[] {
  return DEFAULT_DECISION_POINTS.map((point) => ({
    ...point,
    id: crypto.randomUUID(),
  }));
}

export function createInitialComparisonData(): ComparisonData {
  return {
    category: "",
    categoryMemo: "",
    decisionPoints: createDecisionPoints(),
    pointsMemo: "",
    products: [],
    productsMemo: "",
    scores: [],
    selectedProductId: null,
    decisionMemo: "",
  };
}

export function buildComparisonMemoTitle(data: ComparisonData) {
  const category = data.category.trim();

  if (category) {
    return `${category} の比較メモ`;
  }

  return `比較メモ ${new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date())}`;
}

function hasCustomizedDecisionPoints(decisionPoints: DecisionPoint[]) {
  if (decisionPoints.length !== DEFAULT_DECISION_POINTS.length) {
    return true;
  }

  return decisionPoints.some((point, index) => {
    const defaultPoint = DEFAULT_DECISION_POINTS[index];

    return (
      !defaultPoint ||
      point.name !== defaultPoint.name ||
      point.isImportant !== defaultPoint.isImportant ||
      point.weight !== defaultPoint.weight ||
      point.memo !== defaultPoint.memo
    );
  });
}

export function hasMeaningfulComparisonData(data: ComparisonData) {
  return (
    data.category.trim().length > 0 ||
    data.categoryMemo.trim().length > 0 ||
    hasCustomizedDecisionPoints(data.decisionPoints) ||
    data.pointsMemo.trim().length > 0 ||
    data.products.length > 0 ||
    data.productsMemo.trim().length > 0 ||
    data.scores.length > 0 ||
    data.selectedProductId !== null ||
    data.decisionMemo.trim().length > 0
  );
}

export function getInitialStepForComparisonData(data: ComparisonData) {
  const hasStepOne = data.category.trim().length > 0;
  const hasStepTwo =
    data.decisionPoints.length > 0 &&
    data.decisionPoints.some((point) => point.isImportant);
  const hasStepThree = data.products.length >= 2;

  if (!hasStepOne) {
    return 1;
  }

  if (!hasStepTwo) {
    return 2;
  }

  if (!hasStepThree) {
    return 3;
  }

  if (data.selectedProductId || data.decisionMemo.trim().length > 0) {
    return 6;
  }

  if (data.scores.length > 0) {
    return 5;
  }

  return 4;
}
