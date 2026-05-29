import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background:
          "linear-gradient(135deg, rgb(12, 18, 32) 0%, rgb(24, 60, 47) 52%, rgb(231, 249, 235) 100%)",
        color: "rgb(244, 247, 245)",
        padding: "64px",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: 28,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(244, 247, 245, 0.72)",
        }}
      >
        Compare Better
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
          オレの比較メモ
        </div>
        <div
          style={{
            maxWidth: 900,
            fontSize: 32,
            lineHeight: 1.5,
            color: "rgba(244, 247, 245, 0.88)",
          }}
        >
          ガジェットや家電の比較ポイント、評価、最終判断をひとつのメモに整理できる
          Web アプリ
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          color: "rgba(244, 247, 245, 0.78)",
        }}
      >
        <div>my-hikaku-memo</div>
      </div>
    </div>,
    size,
  );
}
