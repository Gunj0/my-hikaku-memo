import { NextResponse } from "next/server";

import { auth } from "@/auth";

/** メモ系 API 共通の未認証メッセージ。 */
export const MEMO_AUTH_REQUIRED_MESSAGE =
  "ログインすると保存済みメモを利用できます。";

/** `{ message }` 形式の JSON エラーレスポンスを生成する。 */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export const unauthorizedResponse = (message = MEMO_AUTH_REQUIRED_MESSAGE) =>
  jsonError(message, 401);
export const badRequestResponse = (message: string) => jsonError(message, 400);
export const notFoundResponse = (message: string) => jsonError(message, 404);

type AuthedHandler<Ctx> = (
  userId: string,
  request: Request,
  context: Ctx,
) => Promise<Response> | Response;

/**
 * ルートハンドラを認証ガードで包む。
 * セッションが無ければ 401 を返し、ハンドラは呼ばれない。
 * 認証済みなら確定した userId をハンドラへ渡す。
 *
 * これにより「各ハンドラで認証チェックを書き忘れる」事故を構造的に防ぐ。
 */
export function withAuth<Ctx = unknown>(
  handler: AuthedHandler<Ctx>,
  options?: { message?: string },
) {
  return async (request: Request, context: Ctx): Promise<Response> => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return unauthorizedResponse(options?.message);
    }

    return handler(userId, request, context);
  };
}
