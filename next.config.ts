import type { NextConfig } from "next";

/**
 * 全レスポンスに付けるセキュリティヘッダ。
 *
 * CSP に script-src / style-src を含めていないのは意図的。App Router は
 * ブートストラップ用のインラインスクリプトを出すため、nonce を middleware で
 * 通さない限り `'unsafe-inline'` が必要になり、書いても防御にならない。
 * ここでは nonce 無しでも実効性のあるディレクティブだけに絞っている。
 * script-src まで締めるなら nonce の配線が別途必要。
 */
const securityHeaders = [
  // クリックジャッキング対策。frame-ancestors が本命で、X-Frame-Options は後方互換。
  { key: "Content-Security-Policy", value: [
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      // 認証フォームの飛び先を限定する。Google OAuth の遷移先だけ許可。
      "form-action 'self' https://accounts.google.com",
    ].join("; ") },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // includeSubDomains は付けない。http のサブドメインを巻き込む事故を避けるため、
  // 適用範囲を広げるかどうかはドメイン構成を確認したうえで判断すること。
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
