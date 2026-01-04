# shadcnui インストール

## 導入

- [導入手順](https://ui.shadcn.com/docs/installation/next)
  - [カラーについて](https://ui.shadcn.com/colors)
    - neutral, stone, zinc, slate, gray

```zsh
% pnpm dlx shadcn@latest init
 WARN  1 deprecated subdependencies found: node-domexception@1.0.0
Packages: +336
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 336, reused 161, downloaded 175, added 336, done
╭ Warning ───────────────────────────────────────────────────────────────────╮
│                                                                            │
│   Ignored build scripts: msw@2.12.7.                                       │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed   │
│   to run scripts.                                                          │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯
✔ Preflight checks.
✔ Verifying framework. Found Next.js.
✔ Validating Tailwind CSS config. Found v4.
✔ Validating import alias.
✔ Which color would you like to use as the base color? › Neutral
✔ Writing components.json.
✔ Checking registry.
✔ Updating CSS variables in src/app/globals.css
✔ Installing dependencies.
✔ Created 1 file:
  - src/lib/utils.ts

Success! Project initialization completed.
You may now add components.
```

以下が package.json に追加される

```zsh
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "tw-animate-css": "^1.4.0",
  }
```

以下ファイルが追加される

```text
./components.json
./lib/utils.ts
```

global.css に色定義が追加される

## Button 追加

- [Button](https://ui.shadcn.com/docs/components/button)

```zsh
% pnpm dlx shadcn@latest add button
✔ Checking registry.
✔ Installing dependencies.
✔ Created 1 file:
  - src/components/ui/button.tsx
```

- 追加 package

```json
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.4",
  }
```

## Card

- [Card](https://ui.shadcn.com/docs/components/card)

```zsh
% pnpm dlx shadcn@latest add card
✔ Checking registry.
✔ Created 1 file:
  - src/components/ui/card.tsx
```
