import { NextResponse } from "next/server";

import { COMPARISON_MEMOS_MAX_COUNT_PER_USER } from "@/lib/comparison-limits";
import { comparisonMemoPayloadSchema } from "@/lib/comparison-schemas";
import { badRequestResponse, jsonError, withAuth } from "@/lib/server/api";
import {
  MEMO_LIMIT_REACHED,
  createComparisonMemo,
  listComparisonMemos,
} from "@/lib/server/comparison-memos";

export const GET = withAuth(async (userId) => {
  const memos = await listComparisonMemos(userId);

  return NextResponse.json({ memos });
});

export const POST = withAuth(async (userId, request) => {
  const json = await request.json().catch(() => null);
  const parsed = comparisonMemoPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return badRequestResponse("保存データの形式が正しくありません。");
  }

  const memo = await createComparisonMemo(userId, parsed.data);

  if (memo === MEMO_LIMIT_REACHED) {
    return jsonError(
      `保存できるメモは${COMPARISON_MEMOS_MAX_COUNT_PER_USER}件までです。不要なメモを削除してから保存してください。`,
      409,
    );
  }

  // 採番結果を取り出せない場合。201 で memo: null を返すとクライアントが保存成功として扱ってしまう。
  if (!memo) {
    return jsonError("メモを保存できませんでした。", 500);
  }

  return NextResponse.json({ memo }, { status: 201 });
});
