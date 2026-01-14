// 比較メモ
interface HikakuMemo {
  id: string;
  userId: string;
  title: string;
  categories: string[]; // e.g., "スマホ", "PC", "モニター"
  points: Point[];
  products: Product[];
  evaluations?: Evaluation[];
  selectedProductId?: string; // 購入決定した製品
  finalDecisionReason?: string; // 購入決定理由・総評
  createdAt: string;
  updatedAt: string;
}

// ポイント
interface Point {
  id?: string;
  name: string;
  isImportant: boolean;
  constraint?: string; // e.g., "〜10万円", "50cm〜120cm"
}

// 製品
interface Product {
  id?: string;
  name: string;
  isSelected: boolean;
}

// 評価
interface Evaluation {
  productId: string;
  pointId: string;
  rating?: number; // 1-5 stars
  memo?: string;
}

// 比較メモ作成リクエスト
interface HikakuMemoCreateRequest {
  title: string;
  categories: string[];
  points: Point[];
  products: Product[];
  evaluations?: Evaluation[];
  selectedProductId?: string;
  finalDecisionReason?: string;
}

// 比較メモ更新リクエスト
interface HikakuMemoUpdateRequest extends HikakuMemoCreateRequest {
  id: string;
}

export {
  ComparisonMemo,
  ComparisonPoint,
  Evaluation,
  HikakuMemo,
  HikakuMemoCreateRequest,
  HikakuMemoUpdateRequest,
  Point,
  Product,
};
