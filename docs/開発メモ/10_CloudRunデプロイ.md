# Cloud Run デプロイ

## Dockerfile 作成

- 参考: https://zenn.dev/google_cloud_jp/articles/nextjs-on-cloudrun

- `$ npx create-next-app --example with-docker nextjs-on-cloudrun`
- で作成したプロジェクトから、以下をコピーしてルートに配置する
  - Dockerfile
  - Dockerfile.bun
  - .dockerignore
  - app.js
- GitHub へデプロイ

## Cloud Run

- https://console.cloud.google.com/run/overview?pli=1
  - へアクセス
- 新しいプロジェクト
  - プロジェクト名: {自身のプロジェクト名}
  - 場所: 組織なし
- サービス
  - リポジトリから継続的にデプロイ
