import { NextResponse } from "next/server";

import {
  badRequestResponse,
  jsonError,
  notFoundResponse,
  withAuth,
} from "@/lib/server/api";
import {
  USERNAME_TAKEN,
  USER_PROFILE_NAME_MAX_LENGTH,
  normalizeUserProfileName,
  updateUserProfile,
} from "@/lib/server/user-profiles";
import { validateUsername } from "@/lib/username";

type ProfilePatchBody = {
  name?: unknown;
  username?: unknown;
};

function readBody(body: unknown): ProfilePatchBody {
  return body && typeof body === "object" ? (body as ProfilePatchBody) : {};
}

export const PATCH = withAuth(
  async (userId, request) => {
    const body = readBody(await request.json().catch(() => null));
    const hasName = typeof body.name === "string";
    const hasUsername = typeof body.username === "string";

    if (!hasName && !hasUsername) {
      return badRequestResponse("更新する項目を指定してください。");
    }

    // 片方だけ適用されて中途半端な状態にならないよう、検証を先に済ませる。
    let name: string | null = null;

    if (hasName) {
      name = normalizeUserProfileName(body.name as string);

      if (!name) {
        return badRequestResponse("ユーザー名を入力してください。");
      }

      if (name.length > USER_PROFILE_NAME_MAX_LENGTH) {
        return badRequestResponse(
          `ユーザー名は${USER_PROFILE_NAME_MAX_LENGTH}文字以内で入力してください。`,
        );
      }
    }

    let username: string | null = null;

    if (hasUsername) {
      const validation = validateUsername(body.username as string);

      if (!validation.ok) {
        return badRequestResponse(validation.message);
      }

      username = validation.username;
    }

    // 表示名と username は 1 本の UPDATE でまとめて適用する。
    // 分割すると片方だけ反映された中途半端な状態が生まれる。
    const profile = await updateUserProfile(userId, {
      ...(name === null ? {} : { name }),
      ...(username === null ? {} : { username }),
    });

    if (profile === USERNAME_TAKEN) {
      return jsonError("このユーザーIDはすでに使われています。", 409);
    }

    if (!profile) {
      return notFoundResponse("プロフィールが見つかりません。");
    }

    return NextResponse.json(profile);
  },
  { message: "認証が必要です。" },
);
