import {
  DECISION_POINT_IMPORTANCE_OPTIONS,
  getDecisionPointImportanceOption,
  normalizeDecisionPointWeight,
} from "@/lib/types";
import { describe, expect, it } from "vitest";

describe("DECISION_POINT_IMPORTANCE_OPTIONS", () => {
  it("必須・できれば・どちらでもの 3 段階を重い順に持つ", () => {
    expect(
      DECISION_POINT_IMPORTANCE_OPTIONS.map((option) => [
        option.value,
        option.message,
      ]),
    ).toEqual([
      [3, "必須"],
      [2, "できれば"],
      [1, "どちらでも"],
    ]);
  });
});

describe("normalizeDecisionPointWeight", () => {
  it("1 から 3 はそのまま返す", () => {
    expect(normalizeDecisionPointWeight(3)).toBe(3);
    expect(normalizeDecisionPointWeight(2)).toBe(2);
    expect(normalizeDecisionPointWeight(1)).toBe(1);
  });

  it("範囲外は最も近い段階へ丸める", () => {
    expect(normalizeDecisionPointWeight(4)).toBe(3);
    expect(normalizeDecisionPointWeight(0)).toBe(1);
    expect(normalizeDecisionPointWeight(-1)).toBe(1);
  });

  it("整数でない値も 1 から 3 に収める", () => {
    expect(normalizeDecisionPointWeight(2.5)).toBe(2);
    expect(normalizeDecisionPointWeight(Number.NaN)).toBe(1);
  });
});

describe("getDecisionPointImportanceOption", () => {
  it("重要度に対応する選択肢を返す", () => {
    expect(getDecisionPointImportanceOption(3)?.icon).toBe("required");
    expect(getDecisionPointImportanceOption(2)?.icon).toBe("preferred");
    expect(getDecisionPointImportanceOption(1)?.icon).toBe("either");
  });

  it("範囲外の値でも丸めた段階の選択肢を返す", () => {
    expect(getDecisionPointImportanceOption(9)?.message).toBe("必須");
    expect(getDecisionPointImportanceOption(0)?.message).toBe("どちらでも");
  });
});
