import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { category } = (await req.json()) as { category: string };

    if (!category) {
      return Response.json({ error: "カテゴリーが必要です" }, { status: 400 });
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `製品カテゴリー「${category}」で、現在の人気・注目の製品を5〜8個挙げてください。
      
製品名のみを簡潔に回答してください。

回答形式：
- 製品名1
- 製品名2
- 製品名3
（改行区切りのリスト形式）`,
    });

    // Parse the response
    const products = text
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("-") || line.trim().startsWith("•")
      )
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((line) => line.length > 0);

    return Response.json({ products });
  } catch (error) {
    console.error("[v0] AI suggest products error:", error);
    return Response.json(
      { error: "AI提案の生成に失敗しました" },
      { status: 500 }
    );
  }
}
