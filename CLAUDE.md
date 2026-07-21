# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要な参照先

仕様判断が必要なときは `docs/` を参照する。読書順は `docs/00_ドキュメント一覧.md` を起点に確認すること。

## コマンド

```bash
pnpm dev              # 開発サーバー起動（ローカル D1 へ migration 適用後に next dev）
pnpm build            # 本番ビルド（実装後は必ず確認）
pnpm lint             # ESLint
pnpm test:e2e         # Playwright E2E テスト（Chromium のみ）
pnpm test:e2e:ui      # Playwright UI モードで実行
pnpm preview          # OpenNext Cloudflare プレビュー（PR 前に確認）
pnpm deploy           # 本番 D1 へ migration 適用後、Cloudflare へデプロイ
pnpm db:migrate       # 本番 D1 へ migration 適用のみ
pnpm db:migrate:local # ローカル D1 へ migration 適用のみ
```

E2E テストは `tests/e2e/` に配置し、`pnpm dev` が起動済みであれば既存サーバーを再利用する。

## アーキテクチャ

### 技術スタック

- **Next.js 16 App Router** + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Radix UI** (shadcn/ui ベースの `src/components/ui/`)
- **Auth.js v5** (Google OAuth) + **Cloudflare D1** (永続化)
- **OpenNext for Cloudflare** でビルド・デプロイ

### ページ構成

```
/                          → ホーム（公開メモ一覧含む、SSR）
/memos/edit                 → 比較編集フロー（クライアントコンポーネント中心）
/memos/[memoId]            → メモ閲覧（SSR）
/memos                     → 保存済みメモ一覧（要ログイン、SSR）
/api/memos                 → POST/PUT/DELETE（Route Handler）
/api/auth/[...nextauth]    → Auth.js ハンドラ
```

### 比較フローの構造

`/memos/edit` は 5 ステップ構成の単一画面。全体状態は `GadgetComparison`（`src/components/gadget-comparison.tsx`）が保持し、各ステップへ props で渡す。

```
GadgetComparison
  ├─ StepIndicator（ステップ進捗）
  ├─ CategoryStep   (step 1) カテゴリ入力
  ├─ PointsStep     (step 2) 比較ポイント設定（重要度 1-4）
  ├─ ProductsStep   (step 3) 候補製品登録
  ├─ EvaluationStep (step 4) 評価点入力（0-5 × 重要度 = 加重点）
  └─ DecisionStep   (step 5) 最終選択と結論メモ
```

ステップ間は自由移動可能（未入力でもブロックしない）。

### データモデル（`src/lib/types.ts`）

- `ComparisonData` — 比較フロー全体の状態（category, decisionPoints, products, scores, selectedProductId, 各種 memo）
- `DecisionPoint.weight` — 重要度 1-4（`DECISION_POINT_IMPORTANCE_OPTIONS` で定義）
- `ProductScore.score` — 評価点 0-5
- 加重合計点: `Σ(score × weight)` で算出。最大点は `Σ(5 × weight)`

### 状態の永続化

- 未保存ドラフトは `localStorage` に退避（guest / ユーザー単位で分離）
- 保存済みメモは Cloudflare D1 の `comparison_memos` テーブルへ保存（`data` カラムに `ComparisonData` を JSON シリアライズ）
- DB スキーマは `migrations/` の SQL が唯一の正。スキーマ変更時は新しい migration ファイルを追加し、`pnpm db:migrate:local`（ローカル）/ `pnpm db:migrate`（本番、`pnpm deploy` にも組み込み済み）で適用する

### バリデーション

API への書き込みは `src/lib/comparison-schemas.ts` の Zod スキーマで検証。クライアント側は `src/lib/comparison-limits.ts` の上限値でクランプ。

## レビュー観点

- **比較フロー変更時**: 未入力でもステップ間を自由移動できること、保存済みメモのリセットで保存時点の状態へ戻ること、候補削除時に `selectedProductId` の整合性が崩れないこと
- **公開ページ・メタデータ変更時**: canonical、OGP、robots.txt、sitemap.xml、`NEXT_PUBLIC_SITE_URL` の整合性を確認
- **認証・保存・レイアウト変更時**: App Router の prerender と hydration、Auth.js と Google OAuth の導線、Cloudflare preview 環境変数の整合性を確認

## ドキュメント更新

実装を変更した場合は、関連する `docs/` または README.md の記述を同一タスク内で更新する。更新不要の場合はその理由を報告する。
