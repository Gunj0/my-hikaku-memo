"use client";

import AuthGuard from "@/components/auth/auth-guard";
import { SignOut } from "@/components/auth/sign-out";
import CreateHeader from "@/components/common/create-header";
import CreateMemoButton from "@/components/common/create-memo-button";
import { MemoCard } from "@/components/memo/memo-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserProfileCard } from "@/components/user/user-profile-card";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { getMyMemos } from "@/lib/get-memo";
import { HikakuMemo } from "@/types/memo";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserPage() {
  // セッション取得
  const session = authClient.useSession();
  const [isLoading, setIsLoading] = useState(true);

  // メモ取得
  const [memos, setMemos] = useState<HikakuMemo[]>([]);
  const loadMemos = async () => {
    const results = await getMyMemos();
    if (results.error) {
      console.error(`メモ取得エラー: ${results.error}`);
      setMemos([]);
      return;
    }
    setMemos(results.data);
  };

  // 初回ロード時にメモを読み込み
  useEffect(() => {
    (async () => {
      await loadMemos();
      setIsLoading(false);
    })();
  }, []);

  return (
    <AuthGuard>
      {/* ヘッダ */}
      <CreateHeader />
      {/* メイン */}
      <main className="flex flex-1 flex-col bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="mx-4 my-8">
          <div className="mx-auto max-w-7xl">
            {/* ユーザープロフィール */}
            <UserProfileCard
              idOwner={true}
              userIcon={session?.data?.user?.image}
              userName={session?.data?.user?.email}
            />

            {/* 比較メモを作る */}
            <div className="mt-24 text-center">
              <CreateMemoButton />
            </div>

            {/* 比較メモリスト */}
            <div className="mt-24">
              <div className="text-gray-600 mb-4">
                <h2 className="text-lg font-bold mb-4">
                  あなたの比較メモ ({memos.length}件)
                </h2>
                <Button variant="outline" asChild>
                  <Link href={PATH.MEMO.LIST}>すべての比較メモ</Link>
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Spinner />
                </div>
              ) : memos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">まだメモがありません</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {memos.map((memo, id) => (
                    <MemoCard key={id} memo={memo} />
                  ))}
                </div>
              )}
            </div>

            {/* アカウント */}
            <div className="mt-8 text-gray-600">
              <h2 className="text-lg font-bold mb-4">アカウント</h2>
              <SignOut />
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
