"use client";

import type React from "react";

import { Spinner } from "@/components/ui/spinner";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SimpleHeader from "./common/simple-header";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // セッション取得
  const session = authClient.useSession();
  // ロード中
  const [isLoading, setIsLoading] = useState(true);
  // ルータ
  const router = useRouter();

  useEffect(() => {
    // ログインしてない場合ログイン画面へ
    if (!session?.data?.user) {
      const currentPath = window.location.pathname;
      router.push(
        `${PATH.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(currentPath)}`
      );
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <>
        <SimpleHeader />
        <main className="flex flex-1 flex-col items-center justify-center bg-background">
          <Spinner />
        </main>
      </>
    );
  }

  return <>{children}</>;
}
