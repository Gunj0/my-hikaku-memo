import type { ComparisonData, DecisionPoint, Product } from "@/lib/types";
import { DEFAULT_DECISION_POINTS, DEFAULT_PRODUCTS } from "@/lib/types";

function createDecisionPoints(): DecisionPoint[] {
  return DEFAULT_DECISION_POINTS.map((point) => ({
    ...point,
    id: crypto.randomUUID(),
  }));
}

function createProducts(): Product[] {
  return DEFAULT_PRODUCTS.map((product) => ({
    ...product,
    id: crypto.randomUUID(),
  }));
}

export function createInitialComparisonData(): ComparisonData {
  return {
    category: "",
    categoryMemo: "",
    decisionPoints: createDecisionPoints(),
    pointsMemo: "",
    products: createProducts(),
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
      point.weight !== defaultPoint.weight ||
      point.memo !== defaultPoint.memo
    );
  });
}

function hasCustomizedProducts(products: Product[]) {
  // 既定候補を削除しただけの空リストは「入力なし」とみなす。
  // 保存済みメモ以前の下書き（products: []）もここに該当する。
  if (products.length === 0) {
    return false;
  }

  if (products.length !== DEFAULT_PRODUCTS.length) {
    return true;
  }

  return products.some((product, index) => {
    const defaultProduct = DEFAULT_PRODUCTS[index];

    return (
      !defaultProduct ||
      product.name !== defaultProduct.name ||
      product.memo !== defaultProduct.memo
    );
  });
}

export function hasMeaningfulComparisonData(data: ComparisonData) {
  return (
    data.category.trim().length > 0 ||
    data.categoryMemo.trim().length > 0 ||
    hasCustomizedDecisionPoints(data.decisionPoints) ||
    data.pointsMemo.trim().length > 0 ||
    hasCustomizedProducts(data.products) ||
    data.productsMemo.trim().length > 0 ||
    data.scores.length > 0 ||
    data.selectedProductId !== null ||
    data.decisionMemo.trim().length > 0
  );
}

export function getInitialStepForComparisonData(data: ComparisonData) {
  const hasStepOne = data.category.trim().length > 0;
  const hasStepTwo = data.decisionPoints.length > 0;
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

  if (
    data.scores.length > 0 ||
    data.selectedProductId ||
    data.decisionMemo.trim().length > 0
  ) {
    return 5;
  }

  return 4;
}
