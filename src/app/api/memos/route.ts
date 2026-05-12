import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { comparisonMemoPayloadSchema } from "@/lib/comparison-schemas";
import {
  createComparisonMemo,
  listComparisonMemos,
} from "@/lib/server/comparison-memos";

function unauthorizedResponse() {
  return NextResponse.json(
    { message: "ログインすると保存済みメモを利用できます。" },
    { status: 401 },
  );
}

function badRequestResponse(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorizedResponse();
  }

  const memos = await listComparisonMemos(userId);
  return NextResponse.json({ memos });
}

export async function POST(request: Request) {
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

  const memo = await createComparisonMemo(userId, parsed.data);

  return NextResponse.json({ memo }, { status: 201 });
}
