import { cache } from "react";

import { auth } from "@/auth";
import {
  getPublicComparisonMemo,
  listComparisonMemosByUsername,
} from "@/lib/server/comparison-memos";
import { getUserProfileByUsername } from "@/lib/server/user-profiles";

/**
 * 1 リクエスト内で重複する読み取りをまとめるラッパ群。
 *
 * App Router では `generateMetadata` とページ本体が同一リクエストの
 * レンダリング内で走るため、両方が同じデータを取得すると DB 往復が倍になる。
 * React の `cache()` はリクエストスコープで結果を共有するため、
 * 呼び出し側を書き換えずに重複を消せる。
 *
 * ここに置いてよいのは「同一リクエスト内で結果が変わらない読み取り専用の取得」だけ。
 * 書き込み直後に再取得する関数（`getComparisonMemo` は `updateComparisonMemo` が
 * UPDATE 後の再取得に使っている）を包むと、同一リクエスト内で更新前の値を返す。
 *
 * API ルートは `withAuth` が `auth()` を 1 回呼ぶだけなので、ここを経由しない。
 *
 * 省略可能な引数を持つ関数は、`cache()` が引数の個数ごとに別のキャッシュノードを
 * 辿るため（`f(a)` と `f(a, undefined)` は別扱い）、ラッパで常に全引数を
 * 渡してから呼ぶ。呼び出し側の書き方に依存させない。
 */

/** セッション解決。1 回ごとに session コールバックが users を SELECT するため重複が高くつく。 */
export const getSession = cache(async () => auth());

export const getUserProfileByUsernameCached = cache(getUserProfileByUsername);

const getPublicComparisonMemoCachedInner = cache(getPublicComparisonMemo);

export function getPublicComparisonMemoCached(
  memoId: string,
  viewerUserId?: string,
) {
  return getPublicComparisonMemoCachedInner(memoId, viewerUserId);
}

const listComparisonMemosByUsernameCachedInner = cache(
  listComparisonMemosByUsername,
);

export function listComparisonMemosByUsernameCached(
  username: string,
  viewerUserId?: string,
) {
  return listComparisonMemosByUsernameCachedInner(username, viewerUserId);
}
