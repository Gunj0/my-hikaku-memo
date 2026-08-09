/**
 * 表示名を返す。空文字・空白のみ・null/undefined の場合は fallback を返す。
 */
export function getDisplayName(
  name: string | null | undefined,
  fallback: string,
): string {
  return name?.trim() || fallback;
}

/**
 * アバター用のイニシャル（表示名の先頭 2 文字を大文字化）。
 * 名前が無い場合は fallback の先頭 2 文字を用いる。
 */
export function getUserInitials(
  name: string | null | undefined,
  fallback: string,
): string {
  return getDisplayName(name, fallback).slice(0, 2).toUpperCase();
}
