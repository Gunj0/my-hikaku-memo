"use client";

import CreateHeader from "@/components/common/create-header";
import CreateMemoButton from "@/components/common/create-memo-button";
import { MemoCard } from "@/components/memo/memo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SITE } from "@/const/Site";
import { getAllMemos, searchAllMemos } from "@/lib/get-memo";
import type { HikakuMemo } from "@/types/memo";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  // メモリスト
  const [memos, setMemos] = useState<HikakuMemo[]>([]);
  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState("");
  // 検索中フラグ
  const [isSearching, setIsSearching] = useState(false);
  // ロード中フラグ
  const [isLoading, setIsLoading] = useState(true);

  // 全メモ読み込み
  const loadAllMemos = async () => {
    const results = await getAllMemos();
    if (results.error) {
      setMemos([]);
      return;
    }
    setMemos(results.data);
  };

  // 検索実行
  const handleSearch = async () => {
    setIsSearching(true);

    if (searchQuery.trim()) {
      const results = await searchAllMemos(searchQuery);
      setMemos(results.data);
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
      setIsLoading(false);
    })();
  }, []);

  return (
    <>
      {/* ヘッダ */}
      <CreateHeader />
      {/* メイン */}
      <main className="flex flex-1 flex-col bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="mx-4 my-8">
          <div className="mx-auto max-w-7xl flex flex-col">
            {/* サイト説明 */}
            <div className="mt-8 text-center">{SITE.DESCRIPTION}</div>

            {/* 比較メモ作成ボタン */}
            <div className="mt-4 text-center">
              <CreateMemoButton />
            </div>

            {isLoading ? (
              <>
                {/* メモロード中 */}
                <div className="flex items-center justify-center min-h-50">
                  <Spinner />
                </div>
              </>
            ) : (
              <>
                {/* 検索バー */}
                <div className="mt-24 mb-8">
                  <h2 className="text-lg text-gray-600 font-bold mb-4">
                    みんなの比較メモ
                  </h2>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="製品ジャンル、製品名、メーカーなどで検索..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="h-10 pl-10 text-base"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      size="lg"
                      className="px-6 cursor-pointer"
                      variant={"outline"}
                    >
                      検索
                    </Button>
                    {searchQuery && (
                      <Button
                        onClick={handleClearSearch}
                        variant="secondary"
                        size="lg"
                      >
                        クリア
                      </Button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      「{searchQuery}」の検索結果: {memos.length}件
                    </p>
                  )}
                </div>

                {/* Memo Grid */}
                {memos.length === 0 ? (
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
                  <>
                    {/* メモあり */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {memos.map((memo) => (
                        <MemoCard key={memo.id} memo={memo} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
