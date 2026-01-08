"use client";

import { SignIn } from "@/components/auth/sign-in";
import { SignOut } from "@/components/auth/sign-out";
import LoginHeader from "@/components/common/login-header";
import { Button } from "@/components/ui/button";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";

export default function UserPage() {
  const session = authClient.useSession();
  const [memos, setMemos] = useState("");
  const getMemos = async () => {
    const { data, error } = await authClient.token();
    if (error || !data) {
      setMemos(`error, ${error.message}`);
      return;
    }
    const jwtToken = data.token;
    console.log("JWT Token:", jwtToken);
    const result = await fetch("/api/backend", {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (result.status === 500) {
      setMemos("取得に失敗しました");
      return;
    }
    const memos = await result.json();
    console.log("Memos from backend API:", memos);

    setMemos(JSON.stringify(memos));
  };

  return (
    <>
      <LoginHeader />
      {session?.data?.session ? (
        <div className="text-center min-h-screen mt-10">
          <p className="mb-10">事前登録ありがとうございます！</p>
          <p className="mb-10">ログイン中: {session.data.user.email}</p>
          <div className="flex justify-center flex-col items-center">
            <Button className="mb-10" variant="outline" asChild>
              <Link href={PATH.MEMO.NEW}>メモ作成サンプルページ</Link>
            </Button>
            <Button className="mb-10" onClick={getMemos} variant="outline">
              メモリスト(作成中)
            </Button>
            {memos && (
              <pre className="text-left max-w-3xl mx-auto mb-10">{memos}</pre>
            )}
          </div>

          <SignOut />
        </div>
      ) : (
        <div className="text-center mt-10">
          <h1 className="mb-10">ログインしてください</h1>
          <SignIn />
        </div>
      )}
    </>
  );
}
