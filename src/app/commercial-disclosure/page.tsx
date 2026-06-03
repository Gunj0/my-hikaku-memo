import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal-page-layout";
import { buildMetadata, getAbsoluteUrl, getRequestSiteUrl } from "@/lib/seo";

const title = "特定商取引法に基づく表記 | オレの比較メモ";
const description =
  "オレの比較メモの運営者情報、提供価格、支払い方法、返品・キャンセル条件などを記載した特定商取引法に基づく表記です。";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return buildMetadata({
    title,
    description,
    path: "/commercial-disclosure",
    keywords: ["特定商取引法", "特商法", "オレの比較メモ"],
    siteUrl,
  });
}

export default async function CommercialDisclosurePage() {
  const siteUrl = await getRequestSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "特定商取引法に基づく表記",
    description,
    inLanguage: "ja-JP",
    url: getAbsoluteUrl("/commercial-disclosure", siteUrl),
    isPartOf: {
      "@type": "WebSite",
      name: "オレの比較メモ",
      url: getAbsoluteUrl("/", siteUrl),
    },
  };

  return (
    <LegalPageLayout
      title="特定商取引法に基づく表記"
      description="現時点の提供条件、問い合わせ先、返品・キャンセル条件を記載しています。"
      updatedAt="2026年6月3日"
      jsonLd={jsonLd}
    >
      <section className="space-y-3">
        <h2>事業者名</h2>
        <p>Gunj0</p>
      </section>

      <section className="space-y-3">
        <h2>運営責任者</h2>
        <p>Gunj0</p>
      </section>

      <section className="space-y-3">
        <h2>所在地</h2>
        <p>請求があった場合、遅滞なく開示します。</p>
      </section>

      <section className="space-y-3">
        <h2>電話番号</h2>
        <p>請求があった場合、遅滞なく開示します。</p>
      </section>

      <section className="space-y-3">
        <h2>お問い合わせ先</h2>
        <p>
          <a href="https://x.com/gunj0dev" target="_blank" rel="noreferrer">
            https://x.com/gunj0dev
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2>販売価格</h2>
        <p>本サービスは現在、無料で提供しています。</p>
      </section>

      <section className="space-y-3">
        <h2>商品代金以外の必要料金</h2>
        <p>インターネット接続に必要な通信料は、利用者の負担となります。</p>
      </section>

      <section className="space-y-3">
        <h2>代金の支払時期および方法</h2>
        <p>現在、課金機能はありません。</p>
      </section>

      <section className="space-y-3">
        <h2>サービスの提供時期</h2>
        <p>利用登録またはアクセス後、直ちに利用できます。</p>
      </section>

      <section className="space-y-3">
        <h2>返品・キャンセル</h2>
        <p>
          デジタルサービスの性質上、提供後の返品はできません。保存済みの比較メモは、利用者自身で削除できます。
        </p>
      </section>

      <section className="space-y-3">
        <h2>動作環境</h2>
        <p>
          最新の主要ブラウザ環境での利用を想定しています。端末やブラウザの状態によっては、一部表示や動作に差異が生じる場合があります。
        </p>
      </section>
    </LegalPageLayout>
  );
}
