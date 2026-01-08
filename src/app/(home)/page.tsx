"use client";

import LoginHeader from "@/components/common/login-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PATH } from "@/const/Path";
import { SITE } from "@/const/Site";
import { formatDate } from "@/lib/date";
import { Memo } from "@/types/memo";
import Link from "next/link";

export default function Home() {
  const memos: Memo[] = [];

  return (
    <>
      <LoginHeader />
      <main className="flex flex-col items-center min-h-screen mx-6">
        {/* タイトルロゴ */}
        <div className="mt-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">
            {SITE.TITLE}
          </h1>
          <p className="text-muted-foreground text-pretty">
            {SITE.DESCRIPTION}
          </p>
        </div>
        {/* 改装中メッセージ */}
        <div className="m-30">Coming soon...</div>

        {/* 新規作成 */}
        <Button
          asChild
          className="mx-auto text-center max-w-min block mb-20"
          variant="outline"
        >
          <Link href={PATH.MEMO.NEW}>メモ作成サンプルページ</Link>
        </Button>

        {/* メモ一覧 */}
        <Card className="w-full m-4 p-4">
          <h2 className="text-2xl font-bold my-2">みんなの比較メモ</h2>
          {memos.length == 0 ? (
            <p className="text-gray-500">まだメモがありません。</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {memos.map((memo) => (
                <Card
                  key={memo.memoId}
                  className="p-4 hover:shadow-lg transition-shadow"
                >
                  {/* line-clamp-2: 3行以上になる場合は...で省略する */}
                  <h3 className="text-xl font-semibold line-clamp-2">
                    {memo.title}
                  </h3>
                  <p className="text-gray-700">{memo.content}</p>
                  <p className="text-sm text-gray-500">
                    {`更新日: ${formatDate(memo.updatedAt)}`}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
