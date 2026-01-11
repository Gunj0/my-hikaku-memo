"use client";

import { SignIn } from "@/components/auth/sign-in";
import Title from "@/components/common/title";
import { Spinner } from "@/components/ui/spinner";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import CreateMemoButton from "./create-memo-button";

export default function CreateHeader() {
  // セッション取得
  const session = authClient.useSession();

  return (
    <header className="flex items-center h-16 border-b w-full justify-between">
      {/* 左側 */}
      <div className="ml-4">
        <Title />
      </div>

      {/* 右側 */}
      <div className="mr-4">
        {session.isPending ? (
          <>
            {/* セッション取得中 */}
            <div className="flex justify-center items-center w-10 h-10">
              <Spinner className="w-5 h-5" />
            </div>
          </>
        ) : session.data?.session ? (
          <>
            {/* ログイン中 */}
            <div className="flex items-center gap-4">
              {session.data.user.image && (
                <>
                  <CreateMemoButton />
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
            <SignIn />
          </>
        )}
      </div>
    </header>
  );
}
