import { NextResponse } from "next/server";

import { comparisonMemoPayloadSchema } from "@/lib/comparison-schemas";
import { badRequestResponse, withAuth } from "@/lib/server/api";
import {
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

  return NextResponse.json({ memo }, { status: 201 });
});
