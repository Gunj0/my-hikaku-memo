import { NextResponse } from "next/server";

import { badRequestResponse, notFoundResponse, withAuth } from "@/lib/server/api";
import {
  USER_PROFILE_NAME_MAX_LENGTH,
  normalizeUserProfileName,
  updateUserProfileName,
} from "@/lib/server/user-profiles";

function getSubmittedName(body: unknown) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const { name } = body as { name?: unknown };

  return typeof name === "string" ? normalizeUserProfileName(name) : "";
}

export const PATCH = withAuth(
  async (userId, request) => {
    const body = await request.json().catch(() => null);
    const name = getSubmittedName(body);

    if (!name) {
      return badRequestResponse("ユーザー名を入力してください。");
    }

    if (name.length > USER_PROFILE_NAME_MAX_LENGTH) {
      return badRequestResponse(
        `ユーザー名は${USER_PROFILE_NAME_MAX_LENGTH}文字以内で入力してください。`,
      );
    }

    const profile = await updateUserProfileName(userId, name);

    if (!profile) {
      return notFoundResponse("プロフィールが見つかりません。");
    }

    return NextResponse.json(profile);
  },
  { message: "認証が必要です。" },
);
