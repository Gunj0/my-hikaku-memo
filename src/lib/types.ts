export interface DecisionPoint {
  id: string;
  name: string;
  isImportant: boolean;
  weight: number; // 1-5
  memo: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonMemo extends ComparisonMemoSummary {
  data: ComparisonData;
}

export const DEFAULT_DECISION_POINTS: Omit<DecisionPoint, "id">[] = [
  { name: "価格", isImportant: true, weight: 3, memo: "" },
  { name: "メーカー・ブランド", isImportant: false, weight: 2, memo: "" },
  { name: "サイズ・重量", isImportant: false, weight: 2, memo: "" },
  { name: "デザイン", isImportant: false, weight: 2, memo: "" },
  { name: "機能・スペック", isImportant: true, weight: 3, memo: "" },
  { name: "バッテリー持続時間", isImportant: false, weight: 2, memo: "" },
  { name: "口コミ・評判", isImportant: false, weight: 2, memo: "" },
  { name: "保証・サポート", isImportant: false, weight: 2, memo: "" },
  { name: "納期・在庫", isImportant: false, weight: 1, memo: "" },
];

export const STEPS = [
  { id: 1, title: "カテゴリ", shortTitle: "カテゴリ" },
  { id: 2, title: "ポイント", shortTitle: "ポイント" },
  { id: 3, title: "候補", shortTitle: "候補" },
  { id: 4, title: "評価", shortTitle: "評価" },
  { id: 5, title: "集計", shortTitle: "集計" },
  { id: 6, title: "結論", shortTitle: "結論" },
] as const;
