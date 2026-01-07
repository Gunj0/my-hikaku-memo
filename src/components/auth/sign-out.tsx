"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOut({ redirectTo }: { redirectTo?: string }) {
  // ルータ
  const router = useRouter();
  // ログアウト処理
  const logOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/" + (redirectTo ?? ""));
        },
      },
    });
  };

  // ログアウトボタン
  return (
    <Button className="cursor-pointer" variant="outline" onClick={logOut}>
      ログアウト
    </Button>
  );
}
