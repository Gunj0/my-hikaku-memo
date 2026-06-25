# オレの比較メモ

## アプリ概要

ガジェットや家電の比較メモ過程を保存できるアプリです。

詳細な要件、設計、画面デザイン方針は docs 配下の文書を参照してください。

## 主要な技術スタック

- Next.js 16 / React 19 / TypeScript
- Auth.js + Google Provider
- Cloudflare D1
- OpenNext for Cloudflare

## セットアップ

```bash
git clone git@github.com:Gunj0/my-hikaku-memo.git
cd my-hikaku-memo
pnpm install
```

### 必要な環境変数

ローカル開発では .env.local と .dev.vars を使います。

- pnpm dev では主に .env.local を使います。
- pnpm preview では Worker ランタイム側の .dev.vars が必要です。

.env.local

```bash
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

.dev.vars

```bash
NEXTJS_ENV=development
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
NEXT_PUBLIC_SITE_URL=http://localhost:8787
```

- NEXT_PUBLIC_SITE_URL は canonical、Open Graph、Twitter Card、robots.txt、sitemap.xml、構造化データの生成基準 URL として利用します。
- ローカル開発では loopback URL に限ってリクエスト URL を補助的に利用します。
- Cloudflare preview / deploy では Worker ランタイムの NEXT_PUBLIC_SITE_URL または SITE_URL に公開 URL を必ず設定してください。
- 本番環境では loopback URL や未設定状態のまま metadata 系を生成しないため、公開 URL 未設定の deploy は失敗します。

### Google OAuth 設定

- 承認済みの JavaScript 生成元に http://localhost:3000 を追加する
- pnpm preview を使う場合は 承認済みの JavaScript 生成元に http://localhost:8787 も追加する
- リダイレクト URI に http://localhost:3000/api/auth/callback/google を追加する
- pnpm preview を使う場合は リダイレクト URI に http://localhost:8787/api/auth/callback/google も追加する
- 本番環境ではデプロイ URL の /api/auth/callback/google を追加する

### Cloudflare D1 設定

1. D1 データベースを作成する
2. wrangler.jsonc の database_id を実際の ID に置き換える
3. Cloudflare の secret に AUTH_SECRET、AUTH_GOOGLE_ID、AUTH_GOOGLE_SECRET を登録する

## 開発用コマンド

### 開発

```bash
pnpm dev
```

### Lint

```bash
pnpm lint
```

### UIテスト

Playwright で未ログインの基本フローを E2E テストできます。

初回・ライブラリアップデート時にはブラウザをインストールします。

```bash
pnpm test:e2e:install
```

テスト実行

```bash
pnpm test:e2e
```

### ビルド

```bash
pnpm build
```

### Cloudflare 向けプレビューとデプロイ

```bash
pnpm preview
pnpm deploy
```

### 保守

wrangler.jsonc を更新した後の型定義再生成

```bash
pnpm run cf-typegen
```

npmパッケージの更新

```bash
pnpm update --latest
```
