"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useState } from "react";

export function SignIn({ redirectTo }: { redirectTo?: string }) {
  // ローディング状態
  const [loading, setLoading] = useState(false);
  // ログイン処理
  const login = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/" + (redirectTo ?? ""),
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
      }
    );
  };

  // ログインボタン
  return (
    <Button
      className="cursor-pointer"
      disabled={loading}
      variant="outline"
      onClick={login}
    >
      <Image src="/google-logo.svg" alt="Google Logo" width={16} height={16} />
      Googleでログインして事前登録
    </Button>
  );
}
