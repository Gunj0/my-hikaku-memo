import { HikakuMemo } from "@/types/memo";
import { User } from "@/types/user";

// ダミーデータ
export const dummyMemos: HikakuMemo[] = [
  {
    id: "1",
    userId: "user1",
    title: "指紋認証と顔認証が絶対欲しいスマホ",
    categories: ["スマートフォン"],
    points: [
      { id: "1", name: "指紋認証", isImportant: true },
      { id: "2", name: "顔認証", isImportant: true },
      {
        id: "3",
        name: "バッテリー容量",
        isImportant: false,
      },
      {
        id: "4",
        name: "カメラ性能",
        isImportant: false,
      },
      { id: "5", name: "画面サイズ", isImportant: true },
      { id: "6", name: "重量", isImportant: false },
      { id: "7", name: "価格", isImportant: true },
    ],
    products: [
      {
        id: "prod1",
        name: "AQUOS sense10",
        isSelected: false,
      },
      {
        id: "prod2",
        name: "iPhone 17",
        isSelected: false,
      },
      {
        id: "prod3",
        name: "Google Pixel 9a",
        isSelected: true,
      },
    ],
    selectedProductId: "prod3",
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
    categories: ["ノートパソコン"],
    points: [],
    products: [],
    selectedProductId: "",
    finalDecisionReason: "",
    evaluations: [],
    createdAt: "2023-02-01T12:00:00Z",
    updatedAt: "2023-02-02T12:00:00Z",
  },
];

export const dummyUsers: User[] = [
  { userId: "user1", userName: "ユーザー1" },
  { userId: "user2", userName: "ユーザー2" },
  { userId: "user3", userName: "ユーザー3" },
];
