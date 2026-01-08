"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOut({ redirectTo }: { redirectTo?: string }) {
  // ローディング状態
  const [loading, setLoading] = useState(false);
  // ルータ
  const router = useRouter();
  // ログアウト処理
  const logOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/" + (redirectTo ?? ""));
        },
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  };

  // ログアウトボタン
  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      disabled={loading}
      onClick={logOut}
    >
      ログアウト
    </Button>
  );
}
