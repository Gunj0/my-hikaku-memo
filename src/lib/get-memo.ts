import { HikakuMemo } from "@/types/memo";
import { dummyMemos } from "./dummy-data";

/* メモ取得 */
// 全てのメモ取得
export async function getAllMemos(): Promise<{
  data: HikakuMemo[];
  error: string | null;
}> {
  return { data: dummyMemos, error: null };
}
// メモID指定でメモ取得
export async function getMemoByMemoId(
  memoId: string
): Promise<{ data: HikakuMemo | null; error: string | null }> {
  return {
    data: dummyMemos.find((memo) => memo.id === memoId) || null,
    error: null,
  };
}
// ユーザID指定でメモ取得
export async function getMemoByUserId(
  userId: string
): Promise<{ data: HikakuMemo[]; error: string | null }> {
  return {
    data: dummyMemos.filter((memo) => memo.userId === userId),
    error: null,
  };
}
// ユーザ自身のメモ取得
export async function getMyMemos(): Promise<{
  data: HikakuMemo[];
  error: string | null;
}> {
  return { data: dummyMemos, error: null };
  // try {
  //   // JWTトークン取得
  //   const { data, error } = await authClient.token();
  //   if (error || !data) throw new Error(`トークン取得エラー: ${error.message}`);
  //   // トークンをセットして API Route リクエスト
  //   const jwtToken = data.token;
  //   const result = await fetch(PATH.API.MEMO.LIST, {
  //     headers: {
  //       Authorization: `Bearer ${jwtToken}`,
  //     },
  //   });
  //   if (!result.ok) throw new Error(`内部エラー: ${result.statusText}`);
  //   // 成功したら返却
  //   const memos: HikakuMemo[] = await result.json();
  //   return { data: memos, error: null };
  // } catch (error: unknown) {
  //   console.error(`${error}`);
  //   return { data: [], error: `${error}` };
  // }
}

/* メモ検索 */
// 全てのメモ検索
export async function searchAllMemos(
  query: string
): Promise<{ data: HikakuMemo[]; error: string | null }> {
  const result = await getAllMemos();
  if (result.error) {
    return { data: [], error: result.error };
  }
  const lowerQuery = query.toLowerCase();
  const memo = result.data.filter(
    (memo) =>
      memo.title?.toLowerCase().includes(lowerQuery) ||
      memo.points?.some((p) => p.name.toLowerCase().includes(lowerQuery)) ||
      memo.categories?.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      memo.products?.some((p) => p.name.toLowerCase().includes(lowerQuery))
  );
  return { data: memo, error: null };
}
// ユーザID指定でメモ検索
export async function searchUserMemos(
  query: string,
  userId: string
): Promise<{ data: HikakuMemo[]; error: string | null }> {
  const result = await getMemoByUserId(userId);
  if (result.error) {
    return { data: [], error: result.error };
  }
  const lowerQuery = query.toLowerCase() || "";
  const memo = result.data.filter(
    (memo) =>
      memo.title?.toLowerCase().includes(lowerQuery) ||
      memo.points?.some((p) => p.name.toLowerCase().includes(lowerQuery)) ||
      memo.categories?.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      memo.products?.some((p) => p.name.toLowerCase().includes(lowerQuery))
  );
  return { data: memo, error: null };
}
// 自身のメモ検索
export async function searchMyMemos(
  query: string
): Promise<{ data: HikakuMemo[]; error: string | null }> {
  const result = await getMyMemos();
  if (result.error) {
    return { data: [], error: result.error };
  }
  const lowerQuery = query.toLowerCase() || "";
  const memo = result.data.filter(
    (memo) =>
      memo.title?.toLowerCase().includes(lowerQuery) ||
      memo.points?.some((p) => p.name.toLowerCase().includes(lowerQuery)) ||
      memo.categories?.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      memo.products?.some((p) => p.name.toLowerCase().includes(lowerQuery))
  );
  return { data: memo, error: null };
}
