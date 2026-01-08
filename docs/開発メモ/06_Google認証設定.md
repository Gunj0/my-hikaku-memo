# Google 認証設定

- 参考
  - [OAuth 2.0 を使用して Google API にアクセスする](https://developers.google.com/identity/protocols/oauth2?hl=ja#1.-obtain-oauth-2.0-credentials-from-the-dynamic_data.setvar.console_name)

## Google API Console 設定

- 1. アプリ用の Google アカウントを作成する
- 2. API とサービス > 有効な API とサービス にアクセス
  - https://console.developers.google.com/?hl=ja
- 3. 「プロジェクトの作成」からプロジェクトを作成
- 4. API とサービス > OAuth 同意画面にアクセス
- 5. 概要 > プロジェクト構成を設定する
- 6. 概要 > OAuth クライアントを作成
  - アプリケーションの種類: ウェブアプリケーション
  - 承認済みの JavaScript 生成元: localhost と本番 URL
  - 承認済みのリダイレクト URI: {origin}//api/auth/callback/google
    - 参考: https://authjs.dev/getting-started/authentication/oauth
- 7. env.local にクライアント ID とシークレットをメモする

```env.local
AUTH_GOOGLE_ID={CLIENT_ID}
AUTH_GOOGLE_SECRET={CLIENT_SECRET}
```

- 8. OAuth 同意画面 > 対象 にテストユーザーを追加する

## auth.ts の provider 追加

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    // AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET の記述は省略可能
  ],
});
```

## クライアント

```tsx
import { signIn } from "@/auth";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button type="submit">Google でログイン</button>
    </form>
  );
}
```

## 動作確認

- アプリから、テストアカウントでログインできることを確認する

## 動作確認完了後

- 対象 > 公開ステータス: 公開 にするとテストアカウント以外からもログイン可能になる
