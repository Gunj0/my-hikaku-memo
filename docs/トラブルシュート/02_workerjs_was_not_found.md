# 02_workerjs_was_not_found

Cloudflare デプロイ時に以下エラーが発生

```zsh
✘ [ERROR] The entry-point file at ".open-next/worker.js" was not found.
```

- Cloudflare > Settings > Build > Build configuration
  - Build command: pnpm opennextjs-cloudflare build
  - として、opennextjs 用のビルドコマンドにする
