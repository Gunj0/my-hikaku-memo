"use client";

import { SignIn } from "@/components/auth/sign-in";
import SimpleHeader from "@/components/common/simple-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginContent() {
  // セッション取得
  const session = authClient.useSession();

  // callbackUrlクエリパラメータ取得
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || PATH.AUTH.USER;

  // ログイン済みならユーザ画面へリダイレクト
  const router = useRouter();
  useEffect(() => {
    if (session?.data?.user) {
      router.push(callbackUrl);
    }
  }, [session?.data?.user, router, callbackUrl]);

  return (
    <>
      <SimpleHeader />
      <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">オレの比較メモ</CardTitle>
            <CardDescription>
              あなただけの比較メモを作りましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto my-20 flex justify-center">
              <SignIn redirectTo={callbackUrl} />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LoginContent />
    </Suspense>
  );
}
