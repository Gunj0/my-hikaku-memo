"use client";

import { SignIn } from "@/components/auth/sign-in";
import Title from "@/components/common/title";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginHeader() {
  // セッション取得
  const session = authClient.useSession();

  return (
    <header className="flex items-center h-16 border-b w-full justify-between">
      {/* タイトル */}
      <div className="mx-4">
        <Title />
      </div>

      {session.isPending ? (
        <>
          {/* セッション取得中 */}
          <div className="mx-4 flex justify-center items-center w-10 h-10">
            <Spinner className="w-5 h-5" />
          </div>
        </>
      ) : session.data?.session ? (
        <>
          {/* ログイン中 */}
          <div className="mx-4 flex items-center gap-4">
            {session.data.user.image && (
              <>
                <Button variant="default" asChild>
                  <Link href={PATH.MEMO.NEW}>
                    <Plus className="h-4 w-4" />
                    メモを作る
                  </Link>
                </Button>
                <Link href={PATH.AUTH.USER}>
                  <Image
                    src={session.data.user.image}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover border-2"
                  />
                </Link>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 未ログイン */}
          <div className="mx-4">
            <SignIn />
          </div>
        </>
      )}
    </header>
  );
}
