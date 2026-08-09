import { NextResponse } from "next/server";

import { comparisonMemoPayloadSchema } from "@/lib/comparison-schemas";
import { badRequestResponse, notFoundResponse, withAuth } from "@/lib/server/api";
import {
  deleteComparisonMemo,
  getComparisonMemo,
  updateComparisonMemo,
} from "@/lib/server/comparison-memos";

type RouteContext = {
  params: Promise<{
    memoId: string;
  }>;
};

const MEMO_NOT_FOUND_MESSAGE = "指定したメモが見つかりません。";

export const GET = withAuth<RouteContext>(async (userId, _request, context) => {
  const { memoId } = await context.params;
  const memo = await getComparisonMemo(userId, memoId);

  if (!memo) {
    return notFoundResponse(MEMO_NOT_FOUND_MESSAGE);
  }

  return NextResponse.json({ memo });
});

export const PUT = withAuth<RouteContext>(async (userId, request, context) => {
  const json = await request.json().catch(() => null);
  const parsed = comparisonMemoPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return badRequestResponse("保存データの形式が正しくありません。");
  }

  const { memoId } = await context.params;
  const memo = await updateComparisonMemo(userId, memoId, parsed.data);

  if (!memo) {
    return notFoundResponse(MEMO_NOT_FOUND_MESSAGE);
  }

  return NextResponse.json({ memo });
});

export const DELETE = withAuth<RouteContext>(
  async (userId, _request, context) => {
    const { memoId } = await context.params;
    const deleted = await deleteComparisonMemo(userId, memoId);

    if (!deleted) {
      return notFoundResponse(MEMO_NOT_FOUND_MESSAGE);
    }

    return new NextResponse(null, { status: 204 });
  },
);
