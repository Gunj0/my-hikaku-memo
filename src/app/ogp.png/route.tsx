import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ImageResponse } from "next/og";

async function getIconSrc(request: Request): Promise<string> {
  const iconUrl = new URL("/icon.png", request.url).toString();

  try {
    const { env } = getCloudflareContext();
    const res = await env.ASSETS!.fetch(iconUrl);
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    // Local dev: fetch from Next.js dev server
    const res = await fetch(iconUrl);
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  }
}

export async function GET(request: Request) {
  const iconSrc = await getIconSrc(request);

  const response = new ImageResponse(
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
          gap: "100px",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 38,
            color: "rgba(240, 246, 252, 0.8)",
            justifyContent: "center",
          }}
        >
          あなただけの「選んだ理由」を残しませんか？
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconSrc}
            width={75}
            height={75}
            style={{ verticalAlign: "middle" }}
            alt="icon"
          />
          <div style={{ fontSize: 75, fontWeight: 700 }}>オレの比較メモ</div>
        </div>
        <div
          style={{
            fontSize: 38,
            color: "rgba(240, 246, 252, 0.8)",
            justifyContent: "center",
          }}
        >
          ガジェットや家電の比較過程を整理できるメモアプリ
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );

  return new Response(response.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
