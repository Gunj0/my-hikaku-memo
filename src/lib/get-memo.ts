import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { HikakuMemo } from "@/types/memo";

// TODO: 本実装
export async function getAllMemos(): Promise<HikakuMemo[]> {
  return dummyMemos;
}

// TODO: 本実装
export async function getMemoById(id: string): Promise<HikakuMemo> {
  return dummyMemos.find((memo) => memo.id === id.toString())!;
}

// TODO: 本実装
export async function getMemos(): Promise<HikakuMemo[]> {
  return dummyMemos;
}

// TODO: 本実装
export async function getMemoByUserId(userId: string): Promise<HikakuMemo[]> {
  return dummyMemos;
}

export async function searchMemos(query: string): Promise<HikakuMemo[]> {
  const memos = await getMemos();
  const lowerQuery = query.toLowerCase() || "";
  return memos
    .filter(
      (memo) =>
        memo.title?.toLowerCase().includes(lowerQuery) ||
        memo.category?.some((c) => c.toLowerCase().includes(lowerQuery)) ||
        memo.products?.some((p) => p.name.toLowerCase().includes(lowerQuery))
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function searchAllMemos(query: string): Promise<HikakuMemo[]> {
  const memos = await getAllMemos();
  const lowerQuery = query.toLowerCase();
  return memos
    .filter(
      (memo) =>
        memo.title?.toLowerCase().includes(lowerQuery) ||
        memo.category?.some((c) => c.toLowerCase().includes(lowerQuery)) ||
        memo.products?.some((p) => p.name.toLowerCase().includes(lowerQuery))
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

// 一時的にメソッド名変更
export async function getMemosTmp(): Promise<string> {
  try {
    // JWTトークン取得
    const { data, error } = await authClient.token();
    if (error || !data) throw new Error(`トークン取得エラー: ${error.message}`);
    const jwtToken = data.token;

    // API Route リクエスト
    const result = await fetch(PATH.API.MEMO.LIST, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (!result.ok) throw new Error(`内部エラー: ${result.text}`);

    // 成功したらJson化して返却
    const memos = await result.json();
    return JSON.stringify(memos);
  } catch (error: unknown) {
    return `その他エラー: ${error}`;
  }
}

const dummyMemos = [
  {
    id: "1",
    userId: "user1",
    category: ["スマートフォン"],
    title: "指紋認証必須スマホ比較メモ",
    points: [
      { id: "p1", name: "画面サイズ", isImportant: true, priority: "高" },
      {
        id: "p2",
        name: "バッテリー容量",
        isImportant: false,
        priority: "中",
      },
    ],
    products: [
      {
        id: "prod1",
        name: "iPhone 13",
        isSelected: false,
      },
      {
        id: "prod2",
        name: "Galaxy S21",
        isSelected: false,
      },
      {
        id: "prod3",
        name: "Pixel 10",
        isSelected: false,
      },
    ],
    selectedProductId: "prod2",
    finalDecisionReason: "安心感のあるブランドで、画面サイズも大きく満足。",
    evaluations: [
      {
        productId: "prod1",
        pointId: "p1",
        rating: 4,
        memo: "画面は綺麗だが、サイズが少し小さい。",
      },
      {
        productId: "prod2",
        pointId: "p1",
        rating: 5,
        memo: "画面サイズが大きくて見やすい。",
      },
      {
        productId: "prod2",
        pointId: "p2",
        rating: 5,
        memo: "いいかんじ。",
      },
    ],
    createdAt: "2025-01-01T12:00:00Z",
    updatedAt: "2025-01-02T12:00:00Z",
  },
  {
    id: "2",
    userId: "user2",
    title: "ノートパソコン比較メモ",
    category: ["ノートパソコン"],
    createdAt: "2023-02-01T12:00:00Z",
    updatedAt: "2023-02-02T12:00:00Z",
  },
];
