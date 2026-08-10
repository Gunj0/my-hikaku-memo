import { ImageResponse } from "next/og";

import { getPublicComparisonMemo } from "@/lib/server/comparison-memos";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type MemoImageProps = {
  params: Promise<{
    username: string;
    memoId: string;
  }>;
};

export default async function OpenGraphImage({ params }: MemoImageProps) {
  const { memoId } = await params;
  const memo = await getPublicComparisonMemo(memoId);

  const title = memo?.title ?? "比較メモ";
  const category = memo?.category || "未設定";
  const authorName = memo?.author.name ?? "匿名ユーザー";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(145deg, rgb(15, 20, 35) 0%, rgb(31, 84, 59) 60%, rgb(239, 248, 238) 100%)",
        padding: "56px",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "32px",
          background: "rgba(7, 10, 20, 0.28)",
          padding: "44px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "rgba(255,255,255,0.76)",
          }}
        >
          <div>オレの比較メモ</div>
          <div>公開メモ</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "100%",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              color: "rgba(255,255,255,0.88)",
              fontSize: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              カテゴリ: {category}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "rgba(255,255,255,0.78)",
          }}
        >
          {/* Satori は子ノードが 2 つ以上ある要素に display の明示を要求する。
              テキスト + 変数展開で子が 2 つになるため、省略すると描画が例外で落ちる。 */}
          <div style={{ display: "flex" }}>作成者: {authorName}</div>
          <div style={{ display: "flex" }}>比較ポイントと判断を一覧化</div>
        </div>
      </div>
    </div>,
    size,
  );
}
