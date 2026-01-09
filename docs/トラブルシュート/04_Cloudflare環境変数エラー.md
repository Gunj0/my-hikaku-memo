# Cloudflare 環境変数エラー

- Cloudflare Worker へデプロイ時にエラー

- [Next.js の事前レンダリング エラー](https://nextjs.org/docs/messages/prerender-error)

```text
17:54:56.678 Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error
17:54:56.678	TypeError: Failed to parse URL from undefinednote
17:54:56.678	    at <unknown> (.next/server/chunks/586.js:1:56470)
17:54:56.678	    at $ (.next/server/chunks/586.js:1:38102)
17:54:56.678	    at <unknown> (.next/server/chunks/586.js:1:40631)
17:54:56.678	    at async ar (.next/server/app/page.js:1:30158) {
17:54:56.678	  digest: '1868207855',
17:54:56.678	  [cause]: TypeError: Invalid URL
17:54:56.678	      at <unknown> (.next/server/chunks/586.js:1:56470)
17:54:56.678	      at $ (.next/server/chunks/586.js:1:38102)
17:54:56.678	      at <unknown> (.next/server/chunks/586.js:1:40631)
17:54:56.678	      at async ar (.next/server/app/page.js:1:30158) {
17:54:56.678	    code: 'ERR_INVALID_URL',
17:54:56.678	    input: 'undefinednote'
17:54:56.678	  }
17:54:56.680	}
17:54:56.681	Export encountered an error on /page: /, exiting the build.
17:54:56.688	 ⨯ Next.js build worker exited with code: 1 and signal: null
17:54:56.744	Failed: error occurred while running build command
```

- ビルド時に環境変数を取得できず失敗している
- Cloudflare の「設定 > 変数とシークレット」はアプリ実行時のもの
  - 「設定 > ビルド > 変数とシークレット」にビルド時の環境変数設定が必要
  - →API_URL をビルド時環境変数に設定することで解決
