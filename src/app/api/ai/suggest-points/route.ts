import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { category } = (await req.json()) as { category: string };

    if (!category) {
      return Response.json({ error: "カテゴリーが必要です" }, { status: 400 });
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `製品カテゴリー「${category}」を購入する際に、一般的に比較検討するポイントを5〜8個挙げてください。
      
各ポイントは簡潔に（2〜5文字程度）で回答してください。

回答形式：
- ポイント1
- ポイント2
- ポイント3
（改行区切りのリスト形式）`,
    });

    // Parse the response
    const points = text
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("-") || line.trim().startsWith("•")
      )
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((line) => line.length > 0);

    return Response.json({ points });
  } catch (error) {
    console.error("[v0] AI suggest points error:", error);
    return Response.json(
      { error: "AI提案の生成に失敗しました" },
      { status: 500 }
    );
  }
}
