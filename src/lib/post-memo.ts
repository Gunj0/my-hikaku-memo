import {
  HikakuMemo,
  HikakuMemoCreateRequest,
  HikakuMemoUpdateRequest,
} from "@/types/memo";
import { dummyMemos } from "./dummy-data";

// TODO: 実装
export async function createMemo(
  memo: HikakuMemoCreateRequest
): Promise<{ data: HikakuMemo; error: string | null }> {
  return { data: dummyMemos[0] as HikakuMemo, error: null };
}

// TODO: 実装
export async function updateMemo(
  memo: HikakuMemoUpdateRequest
): Promise<{ data: HikakuMemo; error: string | null }> {
  return { data: dummyMemos[0] as HikakuMemo, error: null };
}

// TODO: 実装
export async function deleteMemo(
  memoId: string
): Promise<{ data: string; error: string | null }> {
  return { data: memoId, error: null };
}
