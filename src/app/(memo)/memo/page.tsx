"use client";

import AuthGuard from "@/components/auth/auth-guard";
import CreateHeader from "@/components/common/create-header";
import { MemoCard } from "@/components/memo/memo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { getMyMemos, searchMyMemos } from "@/lib/get-memo";
import type { HikakuMemo } from "@/types/memo";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MemosPage() {
  // セッション
  const session = authClient.useSession();
  // メモリスト
  const [memos, setMemos] = useState<HikakuMemo[]>([]);
  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState("");
  // ルータ
  const router = useRouter();
  // ロード中
  const [isLoading, setIsLoading] = useState(true);

  const loadMemos = async () => {
    setIsLoading(true);
    const userMemos = await getMyMemos();
    setMemos(userMemos.data);
    setIsLoading(false);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    if (searchQuery.trim()) {
      const results = await searchMyMemos(searchQuery);
      setMemos(results.data);
    } else {
      await loadMemos();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (session?.data?.user) {
      loadMemos();
    }
  }, [session?.data?.user]);

  return (
    <AuthGuard>
      <CreateHeader />
      <main className="flex flex-1 flex-col bg-linear-to-br from-slate-50 to-slate-100">
        <div className="">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <p className="mt-1 font-bold">あなたの比較メモリスト</p>
            </div>

            {/* Search and Create */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="製品ジャンルや製品名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => router.push(PATH.MEMO.NEW)}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </div>

            {/* Memo Grid */}
            {memos.length === 0 ? (
              <div className="flex min-h-100 items-center justify-center rounded-lg border-2 border-dashed bg-white">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    メモがありません
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    新規作成ボタンから最初の比較メモを作成しましょう
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {memos.map((memo) => (
                  <MemoCard key={memo.id} memo={memo} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
