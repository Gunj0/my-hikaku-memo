# my-hikaku-memo

[オレの比較メモ](https://my-hikaku-memo.com)
のフロントエンドサービスです。

バックエンドプロジェクトはこちら。
[MyHikakuMemo](https://github.com/Gunj0/MyHikakuMemo)

## 技術構成

- Next.js 15
  - App router
- Better Auth
- Shadcn/ui
- Tailwind CSS

## 起動方法

- 1. `template.env`をコピーして`.env` に環境変数を記入する。
- 2. 以下コマンドで npm パッケージ復元と起動を行う。

```zsh
pnpm install
pnpm run dev
```

- 3. http://localhost:3000 を開く。

## Cloudflare 動作確認

このプロジェクトは Cloudflare Workers で動作することを想定しています。
以下コマンドで Cloudflare で使用する OpenNext 環境での動作確認を行うことができます。

```zsh
pnpm run preview
```
