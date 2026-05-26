# CHANGELOG

## Cloudflare + Next.js でのプロジェクト初期構成

- [Cloudflare Workers + Next.js](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

```bash
pnpm create cloudflare@latest my-next-app --framework=next
```

```text
.
├── cloudflare-env.d.ts
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── open-next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│   ├── _headers
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── window.svg
├── README.md
├── src
│   └── app
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── tsconfig.json
└── wrangler.jsonc
```

```package.json
{
  "name": "cloudflare-app-260526",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts"
  },
  "dependencies": {
    "@opennextjs/cloudflare": "^1.19.11",
    "next": "16.2.6",
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.5",
    "@tailwindcss/postcss": "^4.3.0",
    "@types/node": "^20.19.41",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4.3.0",
    "typescript": "^5.9.3",
    "wrangler": "^4.94.0"
  }
}
```

## D1 データベースの初期構成

- [Cloudflare D1](https://developers.cloudflare.com/d1/get-started/quickstart/)

```wrangler.json
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-hikaku-memo-db",
      "database_id": "0ecb1d07-a66d-4480-857c-cdf9aa424d03",
    },
  ],
```

## shadcn/ui の導入

- [shadcn/ui](https://ui.shadcn.com/docs/installation)

```bash
pnpm dlx shadcn@latest init -t next
```
