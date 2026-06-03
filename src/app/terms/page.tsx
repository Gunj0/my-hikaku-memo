import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal-page-layout";
import { buildMetadata, getAbsoluteUrl, getRequestSiteUrl } from "@/lib/seo";

const title = "利用規約 | オレの比較メモ";
const description =
  "オレの比較メモの利用条件、禁止事項、免責事項などを定めた利用規約です。";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title,
    description,
    path: "/terms",
    keywords: ["利用規約", "比較メモ", "オレの比較メモ"],
    siteUrl,
  });
}

export default async function TermsPage() {
  const siteUrl = await getRequestSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "利用規約",
    description,
    inLanguage: "ja-JP",
    url: getAbsoluteUrl("/terms", siteUrl),
    isPartOf: {
      "@type": "WebSite",
      name: "オレの比較メモ",
      url: getAbsoluteUrl("/", siteUrl),
    },
  };

  return (
    <LegalPageLayout
      title="利用規約"
      description="本サービスの利用条件、禁止事項、免責事項を記載しています。"
      updatedAt="2026年6月3日"
      jsonLd={jsonLd}
    >
      <section className="space-y-3">
        <h2>第1条 適用</h2>
        <p>
          本利用規約は、Gunj0
          が提供する「オレの比較メモ」（以下「本サービス」）の利用条件を定めるものです。利用者は、本サービスを利用した時点で本規約に同意したものとみなします。
        </p>
      </section>

      <section className="space-y-3">
        <h2>第2条 本サービスの内容</h2>
        <p>
          本サービスは、ガジェットや家電などの比較情報、評価、メモを作成・保存・公開するための
          Web サービスです。
        </p>
      </section>

      <section className="space-y-3">
        <h2>第3条 禁止事項</h2>
        <ul>
          <li>法令または公序良俗に反する行為</li>
          <li>第三者の権利や利益を侵害する行為</li>
          <li>不正アクセス、過度な負荷、サービス運営を妨げる行為</li>
          <li>虚偽情報や誤認を招く情報を投稿または保存する行為</li>
          <li>本サービスを不正な目的で利用する行為</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>第4条 知的財産権</h2>
        <p>
          本サービスに関するプログラム、デザイン、名称、文章その他の知的財産権は、運営者または正当な権利者に帰属します。利用者が投稿した内容については、利用者自身が必要な権利を有しているものとします。
        </p>
      </section>

      <section className="space-y-3">
        <h2>第5条 免責事項</h2>
        <ul>
          <li>
            本サービスは現状有姿で提供され、特定目的への適合性を保証しません。
          </li>
          <li>
            本サービスの利用または利用不能により生じた損害について、運営者は責任を負いません。
          </li>
          <li>
            利用者が保存または公開した情報の正確性、完全性、有用性は利用者自身が確認するものとします。
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>第6条 サービスの変更・停止</h2>
        <p>
          運営者は、保守、障害対応、仕様変更その他の理由により、利用者への事前通知なく本サービスの全部または一部を変更、停止または終了できるものとします。
        </p>
      </section>

      <section className="space-y-3">
        <h2>第7条 規約の変更</h2>
        <p>
          運営者は、必要に応じて本規約を変更できます。変更後の規約は、本ページへ掲載した時点から効力を生じます。
        </p>
      </section>

      <section className="space-y-3">
        <h2>第8条 準拠法・裁判管轄</h2>
        <p>
          本規約は日本法に準拠します。本サービスに関して紛争が生じた場合は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </section>

      <section className="space-y-3">
        <h2>第9条 お問い合わせ</h2>
        <p>
          本規約に関するお問い合わせは、
          <a href="https://x.com/gunj0dev" target="_blank" rel="noreferrer">
            Gunj0 の X アカウント
          </a>
          までご連絡ください。
        </p>
      </section>
    </LegalPageLayout>
  );
}
