export interface DecisionPoint {
  id: string;
  name: string;
  weight: number; // 1-4
  memo: string;
}

export type DecisionPointImportanceIconName =
  | "circle-alert"
  | "circle"
  | "triangle"
  | "x";

export const DECISION_POINT_IMPORTANCE_OPTIONS = [
  { value: 4, icon: "circle-alert", message: "最も重要" },
  { value: 3, icon: "circle", message: "重要" },
  { value: 2, icon: "triangle", message: "どちらでもいい" },
  { value: 1, icon: "x", message: "いらない" },
] as const;

export type DecisionPointWeight =
  (typeof DECISION_POINT_IMPORTANCE_OPTIONS)[number]["value"];

export function normalizeDecisionPointWeight(
  weight: number,
): DecisionPointWeight {
  if (weight >= 4) {
    return 4;
  }

  if (weight === 3) {
    return 3;
  }

  if (weight === 2) {
    return 2;
  }

  return 1;
}

export function getDecisionPointImportanceOption(weight: number) {
  return DECISION_POINT_IMPORTANCE_OPTIONS.find(
    (option) => option.value === normalizeDecisionPointWeight(weight),
  );
}

export interface Product {
  id: string;
  name: string;
  memo: string;
}

export interface ProductScore {
  productId: string;
  pointId: string;
  score: number; // 1-5
  memo: string;
}

export interface ComparisonData {
  category: string;
  categoryMemo: string;
  decisionPoints: DecisionPoint[];
  pointsMemo: string;
  products: Product[];
  productsMemo: string;
  scores: ProductScore[];
  selectedProductId: string | null;
  decisionMemo: string;
}

export interface ComparisonMemoSummary {
  id: string;
  title: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonMemo extends ComparisonMemoSummary {
  data: ComparisonData;
}

export interface ComparisonMemoAuthor {
  id: string;
  name: string | null;
  /** URL ハンドル。`/{username}/{memoId}` の組み立てに用いる。 */
  username: string;
  image: string | null;
}

export interface PublicComparisonMemoSummary extends ComparisonMemoSummary {
  author: ComparisonMemoAuthor;
}

export interface PublicComparisonMemo extends ComparisonMemo {
  author: ComparisonMemoAuthor;
  isOwner: boolean;
}

export const DEFAULT_DECISION_POINTS: Omit<DecisionPoint, "id">[] = [
  { name: "価格", weight: 3, memo: "" },
  { name: "メーカー・ブランド", weight: 3, memo: "" },
  { name: "サイズ・重量", weight: 3, memo: "" },
  { name: "デザイン", weight: 3, memo: "" },
];

export const STEPS = [
  { id: 1, title: "カテゴリ", shortTitle: "カテゴリ" },
  { id: 2, title: "ポイント", shortTitle: "ポイント" },
  { id: 3, title: "候補", shortTitle: "候補" },
  { id: 4, title: "評価", shortTitle: "評価" },
  { id: 5, title: "結論", shortTitle: "結論" },
] as const;
