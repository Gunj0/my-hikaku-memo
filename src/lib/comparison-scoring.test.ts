import {
  calculateProductTotal,
  getMaxPossibleScore,
  getProductPointScore,
  getProductTotalScore,
  getTopTotalScore,
  rankProductTotals,
} from "@/lib/comparison-scoring";
import type { DecisionPoint, Product, ProductScore } from "@/lib/types";
import { describe, expect, it } from "vitest";

const points: DecisionPoint[] = [
  { id: "price", name: "価格", weight: 3, memo: "" },
  { id: "design", name: "デザイン", weight: 2, memo: "" },
];

const products: Product[] = [
  { id: "a", name: "A", memo: "" },
  { id: "b", name: "B", memo: "" },
];

function score(
  productId: string,
  pointId: string,
  value: number,
): ProductScore {
  return { productId, pointId, score: value, memo: "" };
}

describe("getProductPointScore", () => {
  it("一致する評価点を返す", () => {
    const scores = [score("a", "price", 4)];

    expect(getProductPointScore(scores, "a", "price")).toBe(4);
  });

  it("該当が無ければ 0 を返す", () => {
    expect(getProductPointScore([], "a", "price")).toBe(0);
  });

  it("評価点 0 をそのまま 0 として返す", () => {
    const scores = [score("a", "price", 0)];

    expect(getProductPointScore(scores, "a", "price")).toBe(0);
  });
});

describe("getProductTotalScore", () => {
  it("Σ(score × weight) を計算する", () => {
    const scores = [score("a", "price", 4), score("a", "design", 5)];

    // 4*3 + 5*2 = 22
    expect(getProductTotalScore(scores, points, "a")).toBe(22);
  });

  it("未評価ポイントは 0 点として扱う", () => {
    const scores = [score("a", "price", 4)];

    // 4*3 + 0*2 = 12
    expect(getProductTotalScore(scores, points, "a")).toBe(12);
  });

  it("比較ポイントが無ければ 0", () => {
    expect(getProductTotalScore([], [], "a")).toBe(0);
  });
});

describe("getMaxPossibleScore", () => {
  it("Σ(5 × weight) を計算する", () => {
    // 5*3 + 5*2 = 25
    expect(getMaxPossibleScore(points)).toBe(25);
  });

  it("比較ポイントが無ければ 0", () => {
    expect(getMaxPossibleScore([])).toBe(0);
  });
});

describe("calculateProductTotal", () => {
  it("加重合計点・満点・達成率を返す", () => {
    const scores = [score("a", "price", 4), score("a", "design", 5)];
    const total = calculateProductTotal(products[0], points, scores);

    expect(total).toMatchObject({
      product: products[0],
      totalScore: 22,
      maxPossible: 25,
    });
    expect(total.percentage).toBeCloseTo((22 / 25) * 100);
  });

  it("満点 0（比較ポイント無し）のとき達成率は 0%", () => {
    const total = calculateProductTotal(products[0], [], []);

    expect(total).toMatchObject({
      totalScore: 0,
      maxPossible: 0,
      percentage: 0,
    });
  });
});

describe("rankProductTotals", () => {
  it("加重合計点の降順で並べ替える", () => {
    const scores = [
      score("a", "price", 2),
      score("b", "price", 5),
    ];
    const ranked = rankProductTotals(products, points, scores);

    expect(ranked.map((total) => total.product.id)).toEqual(["b", "a"]);
  });

  it("同点は入力順を維持する", () => {
    const scores = [
      score("a", "price", 3),
      score("b", "price", 3),
    ];
    const ranked = rankProductTotals(products, points, scores);

    expect(ranked.map((total) => total.product.id)).toEqual(["a", "b"]);
  });

  it("候補が空なら空配列", () => {
    expect(rankProductTotals([], points, [])).toEqual([]);
  });
});

describe("getTopTotalScore", () => {
  it("最高得点を返す", () => {
    const scores = [score("a", "price", 2), score("b", "price", 5)];
    const ranked = rankProductTotals(products, points, scores);

    // b: 5*3 = 15
    expect(getTopTotalScore(ranked)).toBe(15);
  });

  it("空リストなら 0", () => {
    expect(getTopTotalScore([])).toBe(0);
  });
});
