"use client";

import LoginHeader from "@/components/common/login-header";
import MemoCard from "@/components/memo/memo-card";
import PATH from "@/const/Path";
import { getMemoByUserId } from "@/lib/get-memo";
import { getUserByUserId } from "@/lib/get-user";
import { HikakuMemo } from "@/types/memo";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function UserMemoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // クエリパラメータのユーザID
  const resolvedParams = use(params);
  // ルータ
  const router = useRouter();
  // メモリスト
  const [memos, setMemos] = useState<HikakuMemo[]>([]);
  // ユーザID、ユーザ名
  const [user, setUser] = useState<{ userId: string; userName: string }>();
  // ロード中フラグ
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // クエリパラメータからユーザ情報取得
      const targetUser = await getUserByUserId(resolvedParams.userId);
      // ユーザが見つからない場合404
      if (!targetUser || targetUser === null) {
        router.replace(PATH.NOT_FOUND);
        return;
      }
      setUser(targetUser);
      // ユーザのメモ取得
      const userMemos = await getMemoByUserId(resolvedParams.userId);
      if (userMemos.error) {
        setMemos([]);
        setIsLoading(false);
        return;
      }
      setMemos(userMemos.data);
      setIsLoading(false);
    })();
  }, [resolvedParams.userId, router]);

  return (
    <>
      {/* ヘッダ */}
      <LoginHeader />
      <main className="flex flex-1 flex-col bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 比較メモリスト */}
          <h2 className="text-lg text-gray-600 font-bold mb-4 flex items-center justify-between">
            {user ? user.userName : "ゲスト"}さんの比較メモ ({memos.length}件)
          </h2>

          {memos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">まだメモがありません</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {memos.map((memo) => (
                <MemoCard key={memo.id} memo={memo} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
