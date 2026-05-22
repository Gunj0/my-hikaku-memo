# プロジェクト指針

## 参照先

- 要件や仕様判断が必要なときは、まず docs/ と README.md を参照する。
- 変更は、このリポジトリの Next.js App Router と OpenNext for Cloudflare の前提に合わせる。

## 実装後の確認

- 実装後は pnpm build が成功することを確認してから完了とする。
- プルリクエストを作成または更新する前に、pnpm build と pnpm preview の両方が成功することを確認する。

## 必須の最低限レビュー観点

- 比較フローを変更する場合は、未入力でもステップ間を自由に移動できること、保存済みメモのリセットで保存時点の状態へ戻ること、候補削除時に最終決定の整合性が崩れないことを確認する。
- 公開ページやメタデータを変更する場合は、canonical、Open Graph、Twitter Card、robots.txt、sitemap.xml、構造化データ、NEXT_PUBLIC_SITE_URL の整合性を確認する。
- 認証、保存、レイアウト、ランタイム境界を変更する場合は、App Router の prerender と hydration を壊していないこと、Auth.js と Google OAuth の導線、Cloudflare preview で必要な環境変数や設定の整合性を確認する。

## 変更方針

- 変更は既存のコードスタイルに合わせて最小限にする。
- 依頼に無関係なリファクタや広範囲の整形は避ける。
