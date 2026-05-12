import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { comparisonMemoPayloadSchema } from "@/lib/comparison-schemas";
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

function unauthorizedResponse() {
  return NextResponse.json(
    { message: "ログインすると保存済みメモを利用できます。" },
    { status: 401 },
  );
}

function notFoundResponse() {
  return NextResponse.json(
    { message: "指定したメモが見つかりません。" },
    { status: 404 },
  );
}

function badRequestResponse(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorizedResponse();
  }

  const { memoId } = await context.params;
  const memo = await getComparisonMemo(userId, memoId);

  if (!memo) {
    return notFoundResponse();
  }

  return NextResponse.json({ memo });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorizedResponse();
  }

  const json = await request.json().catch(() => null);
  const parsed = comparisonMemoPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return badRequestResponse("保存データの形式が正しくありません。");
  }

  const { memoId } = await context.params;
  const memo = await updateComparisonMemo(userId, memoId, parsed.data);

  if (!memo) {
    return notFoundResponse();
  }

  return NextResponse.json({ memo });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorizedResponse();
  }

  const { memoId } = await context.params;
  const deleted = await deleteComparisonMemo(userId, memoId);

  if (!deleted) {
    return notFoundResponse();
  }

  return new NextResponse(null, { status: 204 });
}
