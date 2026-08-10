# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要な参照先

仕様判断が必要なときは `docs/` を参照する。読書順は `docs/00_ドキュメント一覧.md` を起点に確認すること。

## コマンド

```bash
pnpm dev              # 開発サーバー起動（ローカル D1 へ migration 適用後に next dev）
pnpm build            # 本番ビルド（実装後は必ず確認）
pnpm lint             # ESLint
pnpm test:unit        # Vitest ユニットテスト（src/**/*.test.{ts,tsx}）
pnpm test:unit:watch  # Vitest ウォッチモード
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
/[username]                → 公開プロフィール（メモ一覧、SSR）
/[username]/[memoId]       → メモ閲覧（SSR）
/edit                      → 比較編集フロー（クライアントコンポーネント中心）
/settings                  → アカウント設定（表示名・ユーザーID・ログアウト、SSR）
/terms, /privacy, /commercial-disclosure → 法務ページ（静的）
/api/memos                 → GET/POST、/api/memos/[memoId] は GET/PUT/DELETE
/api/profile               → PATCH（表示ユーザー名・ユーザーID 更新）
/api/auth/[...nextauth]    → Auth.js ハンドラ
/robots.txt, /sitemap.xml  → src/app/robots.ts, src/app/sitemap.ts
```

URL の詳細（認証要否、クエリ、インデックス方針）は `docs/11_URL設計.md` を参照する。

**トップレベルのパスを追加する場合は、`src/lib/username.ts` の `RESERVED_USERNAMES` にも同じ語を追加する。** ユーザーID（`users.username`）が `/{username}` としてルート直下を占有するため、予約漏れは既存ユーザーの URL を奪う。

### 比較フローの構造

`/edit` は 5 ステップ構成の単一画面。全体状態は `GadgetComparison`（`src/components/gadget-comparison.tsx`）が保持し、各ステップへ props で渡す。

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
- 1 ユーザーあたりの保存件数は 30 件（`COMPARISON_MEMOS_MAX_COUNT_PER_USER`）。上限判定は INSERT 文の条件として評価し、超過時は 409 を返す
- **同一リクエスト内で重複する読み取りは `src/lib/server/request-scope.ts` を経由する。** `generateMetadata` とページ本体は同じリクエストで走るため、直接取得すると DB 往復が倍になる。書き込み直後に再取得する関数はここへ置かない（同一リクエスト内で更新前の値を返すため）
- DB スキーマは `migrations/` の SQL が唯一の正。スキーマ変更時は新しい migration ファイルを追加し、`pnpm db:migrate:local`（ローカル）/ `pnpm db:migrate`（本番、`pnpm deploy` にも組み込み済み）で適用する

### バリデーション

API への書き込みは `src/lib/comparison-schemas.ts` の Zod スキーマで検証。クライアント側は `src/lib/comparison-limits.ts` の上限値でクランプ。

## レビュー観点

汎用のチェックリストは `docs/12_レビュー観点.md` を参照する。以下はこのリポジトリ固有の必須項目。

- **比較フロー変更時**: 未入力でもステップ間を自由移動できること、保存済みメモのリセットで保存時点の状態へ戻ること、候補削除時に `selectedProductId` の整合性が崩れないこと
- **公開ページ・メタデータ変更時**: canonical、OGP、robots.txt、sitemap.xml、`NEXT_PUBLIC_SITE_URL` の整合性を確認
- **認証・保存・レイアウト変更時**: App Router の prerender と hydration、Auth.js と Google OAuth の導線、Cloudflare preview 環境変数の整合性を確認

## ドキュメント更新

実装を変更した場合は、関連する `docs/` または README.md の記述を同一タスク内で更新する。更新不要の場合はその理由を報告する。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
