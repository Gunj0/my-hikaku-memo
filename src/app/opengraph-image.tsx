import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, rgb(10, 12, 24) 0%, rgb(22, 27, 57) 55%, rgb(69, 98, 255) 100%)",
          color: "white",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.72,
          }}
        >
          compare smarter
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
            {siteConfig.name}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: "920px",
              fontSize: 34,
              lineHeight: 1.5,
              color: "rgba(255, 255, 255, 0.88)",
            }}
          >
            比較条件・評価・最終判断をひとつのメモに整理し、そのまま公開共有できる購入判断アプリ
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "18px",
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.82)",
          }}
        >
          <div>Google 検索対応</div>
          <div>公開メモ共有</div>
          <div>Twitter カード対応</div>
        </div>
      </div>
    ),
    size,
  );
}
