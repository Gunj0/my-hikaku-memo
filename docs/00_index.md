# ドキュメント一覧

## 1. 目的

本ディレクトリは、現行実装を基準とした「オレの比較メモ」の要件定義および設計情報を整理するための文書群である。
要件は「何を実現するか」を定義し、設計は「どのように実現しているか」を定義する。

## 2. 対象システム

- アプリ名: オレの比較メモ
- 対象: 購入候補製品を比較し、最終判断を整理するための Web アプリケーション
- 現行構成: Next.js App Router を用いた単一ページ構成
- 基準日: 2026年5月11日

## 3. 文書一覧

| No. | ファイル                          | 区分 | 目的                                                       |
| --- | --------------------------------- | ---- | ---------------------------------------------------------- |
| 00  | 00_index.md                       | 共通 | 文書全体の索引、読書順、運用方針を示す                     |
| 01  | 01_product-scope.md               | 要件 | プロダクトの目的、対象ユーザー、対象範囲、非対象を定義する |
| 02  | 02_functional-requirements.md     | 要件 | 画面機能、入力、遷移条件、操作ルールを定義する             |
| 03  | 03_non-functional-requirements.md | 要件 | 利用環境、応答性、アクセシビリティ、運用前提などを定義する |
| 04  | 04_system-overview.md             | 設計 | 技術構成、責務分担、レンダリング方針を整理する             |
| 05  | 05_information-model.md           | 設計 | 画面内データモデル、項目定義、制約を定義する               |
| 06  | 06_screen-flow-and-state.md       | 設計 | ステップ遷移、状態変化、進行制御を定義する                 |
| 07  | 07_screen-specifications.md       | 設計 | 各ステップの表示・入力・レスポンシブ差分を定義する         |
| 08  | 08_scoring-and-decision-logic.md  | 設計 | 評価計算、集計、順位付け、最終決定のロジックを定義する     |
| 09  | 09_component-responsibilities.md  | 設計 | コンポーネント単位の責務と依存関係を整理する               |

## 4. 推奨読書順

1. 00_index.md
2. 01_product-scope.md
3. 02_functional-requirements.md
4. 03_non-functional-requirements.md
5. 04_system-overview.md
6. 05_information-model.md
7. 06_screen-flow-and-state.md
8. 07_screen-specifications.md
9. 08_scoring-and-decision-logic.md
10. 09_component-responsibilities.md

## 5. 文書運用方針

- 本文書群は現行実装を説明することを基本とし、未実装の将来構想は原則記載しない。
- 要件変更が先行する場合は、要件文書を先に更新し、その後に設計文書を更新する。
- 実装との乖離がある場合は、差分の理由を明記した上で、要件か実装のどちらを正とするか判断する。
- 画面遷移条件、入力制約、スコア算出ルールは特に乖離しやすいため、変更時は必ず関連文書を同時更新する。

## 6. 文書の前提

- 本アプリは Google ログインを任意機能として持つ。
- ログインしていない利用者でも比較フローの閲覧と入力は行える。
- 保存済みメモの作成、読込、削除は Google ログイン後に利用できる。
- 保存済みメモは Cloudflare D1 に永続化される。
- 比較フロー自体は引き続き 1 画面内で完結する構成である。

## 7. 参照元実装

- アプリ入口: src/app/page.tsx
- 認証設定: auth.ts
- 画面全体制御: src/components/gadget-comparison.tsx
- データモデル: src/lib/types.ts
- 比較状態補助: src/lib/comparison-state.ts
- 保存 API: src/app/api/memos/
- 保存処理: src/lib/server/comparison-memos.ts
- 各ステップ UI: src/components/steps/
- 進捗 UI: src/components/step-indicator.tsx
