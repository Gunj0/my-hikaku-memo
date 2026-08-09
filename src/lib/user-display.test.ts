import { getDisplayName, getUserInitials } from "@/lib/user-display";
import { describe, expect, it } from "vitest";

describe("getDisplayName", () => {
  it("名前があればトリムして返す", () => {
    expect(getDisplayName("  Alice ", "ユーザー")).toBe("Alice");
  });

  it("空文字・空白・null/undefined は fallback", () => {
    expect(getDisplayName("", "ユーザー")).toBe("ユーザー");
    expect(getDisplayName("   ", "ユーザー")).toBe("ユーザー");
    expect(getDisplayName(null, "匿名ユーザー")).toBe("匿名ユーザー");
    expect(getDisplayName(undefined, "HM")).toBe("HM");
  });
});

describe("getUserInitials", () => {
  it("表示名の先頭2文字を大文字化する", () => {
    expect(getUserInitials("alice", "ユーザー")).toBe("AL");
  });

  it("名前が無ければ fallback の先頭2文字", () => {
    expect(getUserInitials("", "HM")).toBe("HM");
    expect(getUserInitials("   ", "ユーザー")).toBe("ユー");
    expect(getUserInitials(null, "匿名ユーザー")).toBe("匿名");
  });

  it("1文字の名前でも成立する", () => {
    expect(getUserInitials("a", "HM")).toBe("A");
  });
});
