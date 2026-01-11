"use client";

import LoginHeader from "@/components/common/login-header";
import SimpleHeader from "@/components/common/simple-header";
import { MemoCard } from "@/components/memo/memo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SITE } from "@/const/Site";
import { getAllMemos, searchAllMemos } from "@/lib/get-memo";
import type { HikakuMemo } from "@/types/memo";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  // 全メモリスト
  const [allMemos, setAllMemos] = useState<HikakuMemo[]>([]);
  // 検索中フラグ
  const [isSearching, setIsSearching] = useState(false);
  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState("");
  // ローディングフラグ
  const [loading, setLoading] = useState(true);
  // ルーター
  const router = useRouter();

  // 全メモ読み込み
  const loadAllMemos = async () => {
    const allMemos = await getAllMemos();
    setAllMemos(allMemos);
  };

  // 検索実行
  const handleSearch = async () => {
    setIsSearching(true);
    if (searchQuery.trim()) {
      const results = await searchAllMemos(searchQuery);
      setAllMemos(results);
    } else {
      await loadAllMemos();
    }
    setIsSearching(false);
  };

  // 検索クリア
  const handleClearSearch = async () => {
    setSearchQuery("");
    await loadAllMemos();
  };

  // 初回ロード時にすべてのメモを読み込み
  useEffect(() => {
    (async () => {
      await loadAllMemos();
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <>
        <SimpleHeader />
        <main className="flex flex-1 items-center justify-center">
          <Spinner />
        </main>
      </>
    );
  }

  return (
    <>
      <LoginHeader />

      <main className="flex flex-1 flex-col bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
        <div>
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* サイト説明 */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mt-2 text-muted-foreground">{SITE.DESCRIPTION}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    onInput={handleSearch}
                    placeholder="製品ジャンル、製品名、メーカーなどで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12 pl-10 text-base"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  size="lg"
                  className="px-6"
                >
                  検索
                </Button>
                {searchQuery && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    size="lg"
                  >
                    クリア
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-muted-foreground">
                  「{searchQuery}」の検索結果: {allMemos.length}件
                </p>
              )}
            </div>

            {/* Memo Grid */}
            {allMemos.length === 0 ? (
              <div className="flex min-h-100 items-center justify-center rounded-lg border-2 border-dashed bg-white">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    {searchQuery
                      ? "検索結果が見つかりませんでした"
                      : "メモがまだありません"}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={handleClearSearch}
                      variant="outline"
                      className="mt-4 bg-transparent"
                    >
                      すべてのメモを表示
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allMemos.map((memo) => (
                  <MemoCard
                    key={memo.id}
                    memo={memo}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
