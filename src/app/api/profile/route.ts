import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  USER_PROFILE_NAME_MAX_LENGTH,
  normalizeUserProfileName,
  updateUserProfileName,
} from "@/lib/server/user-profiles";

function unauthorizedResponse() {
  return NextResponse.json({ message: "認証が必要です。" }, { status: 401 });
}

function getSubmittedName(body: unknown) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const { name } = body as { name?: unknown };

  return typeof name === "string" ? normalizeUserProfileName(name) : "";
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const name = getSubmittedName(body);

  if (!name) {
    return NextResponse.json(
      { message: "ユーザー名を入力してください。" },
      { status: 400 },
    );
  }

  if (name.length > USER_PROFILE_NAME_MAX_LENGTH) {
    return NextResponse.json(
      {
        message: `ユーザー名は${USER_PROFILE_NAME_MAX_LENGTH}文字以内で入力してください。`,
      },
      { status: 400 },
    );
  }

  const profile = await updateUserProfileName(userId, name);

  if (!profile) {
    return NextResponse.json(
      { message: "プロフィールが見つかりません。" },
      { status: 404 },
    );
  }

  return NextResponse.json(profile);
}