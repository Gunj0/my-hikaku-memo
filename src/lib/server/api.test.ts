import { auth } from "@/auth";
import {
  badRequestResponse,
  jsonError,
  MEMO_AUTH_REQUIRED_MESSAGE,
  notFoundResponse,
  unauthorizedResponse,
  withAuth,
} from "@/lib/server/api";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

const mockAuth = auth as unknown as Mock;

async function readBody(response: Response) {
  return (await response.json()) as { message: string };
}

describe("jsonError と各レスポンスヘルパ", () => {
  it("jsonError はステータスと message を設定する", async () => {
    const response = jsonError("boom", 418);

    expect(response.status).toBe(418);
    expect(await readBody(response)).toEqual({ message: "boom" });
  });

  it("unauthorizedResponse は既定で 401 + メモ用メッセージ", async () => {
    const response = unauthorizedResponse();

    expect(response.status).toBe(401);
    expect(await readBody(response)).toEqual({
      message: MEMO_AUTH_REQUIRED_MESSAGE,
    });
  });

  it("unauthorizedResponse はメッセージを上書きできる", async () => {
    const response = unauthorizedResponse("認証が必要です。");

    expect(response.status).toBe(401);
    expect((await readBody(response)).message).toBe("認証が必要です。");
  });

  it("badRequestResponse は 400、notFoundResponse は 404", () => {
    expect(badRequestResponse("x").status).toBe(400);
    expect(notFoundResponse("y").status).toBe(404);
  });
});

describe("withAuth", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("未認証なら 401 を返しハンドラを呼ばない", async () => {
    mockAuth.mockResolvedValue(null);
    const handler = vi.fn();

    const response = await withAuth(handler)(new Request("http://x"), undefined);

    expect(response.status).toBe(401);
    expect(await readBody(response)).toEqual({
      message: MEMO_AUTH_REQUIRED_MESSAGE,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("未認証メッセージを上書きできる", async () => {
    mockAuth.mockResolvedValue({ user: {} });
    const response = await withAuth(vi.fn(), {
      message: "認証が必要です。",
    })(new Request("http://x"), undefined);

    expect(response.status).toBe(401);
    expect((await readBody(response)).message).toBe("認証が必要です。");
  });

  it("認証済みなら userId・request・context を渡してハンドラ結果を返す", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const request = new Request("http://x");
    const context = { params: Promise.resolve({ memoId: "1" }) };
    const expected = new Response("ok");
    const handler = vi.fn().mockResolvedValue(expected);

    const response = await withAuth(handler)(request, context);

    expect(response).toBe(expected);
    expect(handler).toHaveBeenCalledWith("user-1", request, context);
  });
});
