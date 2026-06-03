import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal-page-layout";
import { buildMetadata, getAbsoluteUrl, getRequestSiteUrl } from "@/lib/seo";

const title = "プライバシーポリシー | オレの比較メモ";
const description =
  "オレの比較メモで取得する情報、その利用目的、第三者提供、問い合わせ窓口を定めたプライバシーポリシーです。";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title,
    description,
    path: "/privacy",
    keywords: ["プライバシーポリシー", "個人情報", "オレの比較メモ"],
    siteUrl,
  });
}

export default async function PrivacyPage() {
  const siteUrl = await getRequestSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "プライバシーポリシー",
    description,
    inLanguage: "ja-JP",
    url: getAbsoluteUrl("/privacy", siteUrl),
    isPartOf: {
      "@type": "WebSite",
      name: "オレの比較メモ",
      url: getAbsoluteUrl("/", siteUrl),
    },
  };

  return (
    <LegalPageLayout
      title="プライバシーポリシー"
      description="取得する情報、利用目的、外部サービス利用、問い合わせ窓口を記載しています。"
      updatedAt="2026年6月3日"
      jsonLd={jsonLd}
    >
      <section className="space-y-3">
        <h2>1. 取得する情報</h2>
        <ul>
          <li>
            Google
            ログイン時に提供される氏名、メールアドレス、プロフィール画像などの認証情報
          </li>
          <li>
            利用者が本サービスに保存する比較メモ、公開設定、プロフィール名などの入力情報
          </li>
          <li>
            サービス提供に必要なアクセスログ、エラー情報、Cookie 等の技術情報
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>2. 利用目的</h2>
        <ul>
          <li>ログイン認証、本人確認、アカウント管理のため</li>
          <li>比較メモの保存、表示、公開機能を提供するため</li>
          <li>不正利用の検知、障害対応、サービス改善のため</li>
          <li>重要なお知らせや問い合わせ対応のため</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. 第三者提供</h2>
        <p>
          運営者は、法令に基づく場合を除き、本人の同意なく個人情報を第三者へ提供しません。ただし、認証、ホスティング、データ保存などのために外部サービス事業者へ必要な範囲で情報を取り扱わせることがあります。
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. 外部サービス</h2>
        <p>
          本サービスでは、Google OAuth による認証、Cloudflare
          を利用した配信およびデータ保管を行っています。各サービスにおける情報の取扱いは、それぞれの事業者が定める規約やポリシーに従います。
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. 情報の保存期間と削除</h2>
        <p>
          運営者は、サービス提供に必要な期間、利用者情報を保存します。利用者は、保存した比較メモを本サービス上で削除できます。法令上保持が必要な場合を除き、不要となった情報は適切な方法で削除します。
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. 安全管理</h2>
        <p>
          運営者は、個人情報への不正アクセス、漏えい、改ざん、滅失または毀損を防止するため、合理的な安全管理措置を講じます。
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. お問い合わせ</h2>
        <p>
          個人情報の開示、訂正、利用停止等のご相談は、
          <a href="https://x.com/gunj0dev" target="_blank" rel="noreferrer">
            Gunj0 の X アカウント
          </a>
          までご連絡ください。
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. 改定</h2>
        <p>
          本ポリシーは、法令やサービス内容の変更に応じて改定することがあります。改定後の内容は、本ページ掲載時から効力を生じます。
        </p>
      </section>
    </LegalPageLayout>
  );
}
