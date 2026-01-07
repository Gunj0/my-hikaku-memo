# my-hikaku-memo

[オレの比較メモ](https://my-hikaku-memo.com/)
のフロントエンドサービスです。

## 技術構成

- Next.js 15
  - App router
- Better Auth
- Shadcn/ui
- Tailwind CSS

## 起動方法

```zsh
pnpm install
pnpm run dev
```

http://localhost:3000 を開く

## Cloudflare 動作確認

このプロジェクトは Cloudflare Workers で動作することを想定しています。
以下で Cloudflare 上での動作確認を行うことができます。

```zsh
pnpm run preview
```
