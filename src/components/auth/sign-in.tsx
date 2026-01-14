"use client";

import { Button } from "@/components/ui/button";
import PATH from "@/const/Path";
import authClient from "@/lib/auth-client";
import Image from "next/image";
import { useState } from "react";

export default function SignIn({ redirectTo }: { redirectTo?: string }) {
  // ローディング状態
  const [loading, setLoading] = useState(false);
  // ログイン処理
  const login = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectTo ?? PATH.AUTH.USER,
      },
      {
        onRequest: () => {
          setLoading(true);
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
      <p>Googleで事前登録</p>
    </Button>
  );
}
