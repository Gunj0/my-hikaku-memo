"use client";

import { Spinner } from "@/components/ui/spinner";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // セッション
  const session = authClient.useSession();
  // ルータ
  const router = useRouter();

  useEffect(() => {
    // セッション取得中は何もしない
    if (session.isPending) {
      return;
    }

    if (!session?.data?.user) {
      // ログインしてない場合、クエリを付けてログイン画面へ
      const currentPath = window.location.pathname;
      router.push(
        `${PATH.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(currentPath)}`
      );
    }
  }, [router, session?.data?.user, session.isPending]);

  // セッション取得中、または認証されていない場合はローディング表示
  if (session.isPending || !session?.data?.user) {
    return (
      <>
        <main className="flex flex-1 flex-col items-center justify-center bg-background">
          <Spinner />
        </main>
      </>
    );
  }

  return <>{children}</>;
}
