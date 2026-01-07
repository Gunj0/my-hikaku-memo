# Google アカウントのアイコン取得エラー

- デフォルトでは Image タグでの外部 URL のアクセスは制限される
- next.config.ts に以下設定を追加する必要がある

```ts
const nextConfig: NextConfig = {
  // https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/a/**")],
  },
};
```
