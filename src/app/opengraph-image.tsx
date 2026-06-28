import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const iconData = await readFile(path.join(process.cwd(), "public/icon.png"));
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background: "#010409",
        color: "#f0f6fc",
        flexDirection: "column",
        fontFamily: "sans-serif",
        border: "20px solid #238636",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "50px",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <img
            src={iconSrc}
            width={75}
            height={75}
            style={{ verticalAlign: "middle" }}
          />
          <div style={{ fontSize: 75, fontWeight: 700 }}>オレの比較メモ</div>
        </div>
        <div></div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(240, 246, 252, 0.8)",
            justifyContent: "center",
          }}
        >
          あなただけの「選んだ理由」を残しませんか？
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(240, 246, 252, 0.8)",
            justifyContent: "center",
          }}
        >
          ガジェットや家電の比較過程を整理できるメモアプリ
        </div>
      </div>
    </div>,
    size,
  );
}
