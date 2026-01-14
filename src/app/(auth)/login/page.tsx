"use client";

import SignIn from "@/components/auth/sign-in";
import CreateHeader from "@/components/common/create-header";
import NowLoading from "@/components/common/now-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PATH from "@/const/Path";
import authClient from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginContent() {
  // セッション取得
  const session = authClient.useSession();
  // ルータ
  const router = useRouter();

  // callbackUrlクエリパラメータ取得
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || PATH.AUTH.USER;

  useEffect(() => {
    // セッション取得中は何もしない
    if (session.isPending) {
      return;
    }
    // 既にログインしている場合、callbackUrlへリダイレクト
    if (session?.data?.user) {
      router.push(callbackUrl);
    }
  }, [session?.data?.user, router, callbackUrl, session.isPending]);

  // セッション取得中、または認証されていた場合はローディング表示
  if (session.isPending || session?.data?.user) {
    return <NowLoading />;
  }

  return (
    <>
      <CreateHeader />
      <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">オレの比較メモ</CardTitle>
            <CardDescription>あなただけの比較過程を記録しよう</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-20">
              <SignIn redirectTo={callbackUrl} />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export default function LoginPage() {
  return (
    <Suspense fallback={<NowLoading />}>
      <LoginContent />
    </Suspense>
  );
}
