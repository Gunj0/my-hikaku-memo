# オレの比較メモ

ガジェットや家電の比較メモ過程を保存できるアプリです。

## UI デザイン方針

- Tokyo Night ベースの青紫系を基調にし、保存成功と比較優位だけ Neon Green で強調する。
- 全体を等幅フォントベースで統一し、IBM Plex Mono と JetBrains Mono を中心に構成する。
- 情報密度を優先し、薄いボーダー、小さめの角丸、グリッド感のある背景で比較作業に寄せる。
- ホバーと状態変化は速めにし、アニメーションは補助的に留める。
- UI ラベルやメタ情報は控えめに記号化し、比較ワークベンチのような見た目を目指す。

## 主な機能

- ログイン不要で使える比較フロー
- Google ログインによる保存済みメモ管理
- 複数メモの保存、上書き保存、読込、削除
- Cloudflare D1 への永続化

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Auth.js + Google Provider
- Cloudflare D1
- OpenNext for Cloudflare

## セットアップ

```bash
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
```

.dev.vars

```bash
NEXTJS_ENV=development
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

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

## 開発

```bash
pnpm dev
```

## UIテスト

Playwright で未ログインの基本フローを E2E テストできます。

初回はブラウザをインストールします。

```bash
pnpm test:e2e:install
```

テスト実行

```bash
pnpm test:e2e
```

特定のテストだけ実行する場合

```bash
pnpm exec playwright test tests/e2e/basic-flow.spec.ts --project=chromium
```

レポートUIを開く場合

```bash
pnpm exec playwright show-report
```

## ビルド

```bash
pnpm build
```

## Cloudflare 向けプレビューと配備

```bash
pnpm preview
pnpm deploy
```

## 保守

wrangler.jsonc を更新した後は型定義を再生成します。

```bash
pnpm run cf-typegen
```

npmパッケージの更新

```bash
pnpm update --latest
```
