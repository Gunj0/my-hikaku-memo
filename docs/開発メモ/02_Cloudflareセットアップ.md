# CI セットアップ

## GitHub

- `git push`して GitHub にリポジトリを上げる

## Cloudflare

- Cloudflare > Workers & Pages > デプロイしたプロジェクトを開く
- Settings
  - Domains & Routes > Add > Route
    - Zone: 取得したドメイン
    - Route: {domain}/\*
    - Failure mode: Fail closed
  - Build > Git repository > connect
    - GitHub リポジトリを連携する
    - Build cache: Enabled
