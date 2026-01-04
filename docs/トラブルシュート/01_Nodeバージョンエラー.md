# Node.js バージョンエラー

- Cloudflare で CI 実行時、以下のようなエラーが発生

```zsh
npm error `npm ci` can only install packages when your package.json
```

- Node バージョンが違う環境で `npm i` すると発生する
  - [参考](https://zenn.dev/osushi02/scraps/3403d5dd94005d)
- Cloudflare のログで`nodejs@22.16.0`とあった

```zsh
Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
```

- Node バージョンを変更し、`npm i`し直してデプロイすると解消
  - `mise use node@22.16.0`
