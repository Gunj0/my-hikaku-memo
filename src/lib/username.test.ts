import {
  RESERVED_USERNAMES,
  USERNAME_MAX_LENGTH,
  buildUsernameCandidate,
  generateDefaultUsername,
  normalizeUsername,
  validateUsername,
} from "@/lib/username";
import { describe, expect, it } from "vitest";

describe("normalizeUsername", () => {
  it("トリムして小文字化する", () => {
    expect(normalizeUsername("  Alice_01 ")).toBe("alice_01");
  });
});

describe("validateUsername", () => {
  it("正規形を返す", () => {
    expect(validateUsername("Gunjo")).toEqual({ ok: true, username: "gunjo" });
    expect(validateUsername("a-b_c9")).toEqual({ ok: true, username: "a-b_c9" });
  });

  it("空文字と短すぎる値を拒否する", () => {
    expect(validateUsername("").ok).toBe(false);
    expect(validateUsername("   ").ok).toBe(false);
    expect(validateUsername("ab").ok).toBe(false);
  });

  it("長すぎる値を拒否する", () => {
    expect(validateUsername("a".repeat(USERNAME_MAX_LENGTH)).ok).toBe(true);
    expect(validateUsername("a".repeat(USERNAME_MAX_LENGTH + 1)).ok).toBe(false);
  });

  it("ASCII 英数字と - _ 以外を拒否する", () => {
    expect(validateUsername("ゆーざー").ok).toBe(false);
    expect(validateUsername("user name").ok).toBe(false);
    expect(validateUsername("user.name").ok).toBe(false);
    expect(validateUsername("user/name").ok).toBe(false);
  });

  it("先頭・末尾の記号と記号の連続を拒否する", () => {
    expect(validateUsername("-user").ok).toBe(false);
    expect(validateUsername("user-").ok).toBe(false);
    expect(validateUsername("_user").ok).toBe(false);
    expect(validateUsername("us--er").ok).toBe(false);
    expect(validateUsername("us-_er").ok).toBe(false);
  });

  it("予約語を拒否する", () => {
    expect(validateUsername("settings").ok).toBe(false);
    expect(validateUsername("Edit").ok).toBe(false);
    expect(validateUsername("api").ok).toBe(false);
    expect(validateUsername("commercial-disclosure").ok).toBe(false);
  });

  it("予約語は全て自身のバリデーションを通る形式である", () => {
    // 予約語が形式違反だと、そもそも到達不能な無意味な予約になる。
    for (const reserved of RESERVED_USERNAMES) {
      expect(
        /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(reserved),
        `${reserved} が形式違反`,
      ).toBe(true);
    }
  });
});

describe("generateDefaultUsername", () => {
  it("id のハイフンを除いた先頭 8 文字を使う", () => {
    expect(generateDefaultUsername("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(
      "user-a1b2c3d4",
    );
  });

  it("生成結果はバリデーションを通る", () => {
    const username = generateDefaultUsername(
      "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
    );

    expect(validateUsername(username)).toEqual({ ok: true, username });
  });

  it("英数字を含まない id でも成立する", () => {
    expect(generateDefaultUsername("----")).toBe("user-00000000");
  });
});

describe("buildUsernameCandidate", () => {
  it("1 回目はそのまま返す", () => {
    expect(buildUsernameCandidate("user-a1b2c3d4", 1)).toBe("user-a1b2c3d4");
  });

  it("2 回目以降は連番を付ける", () => {
    expect(buildUsernameCandidate("user-a1b2c3d4", 2)).toBe("user-a1b2c3d4-2");
  });

  it("上限を超えないよう切り詰め、末尾の記号を残さない", () => {
    const candidate = buildUsernameCandidate("a".repeat(USERNAME_MAX_LENGTH), 3);

    expect(candidate.length).toBeLessThanOrEqual(USERNAME_MAX_LENGTH);
    expect(validateUsername(candidate).ok).toBe(true);
  });
});
