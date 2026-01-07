"use client";

import { SignIn } from "@/components/auth/sign-in";
import { SignOut } from "@/components/auth/sign-out";
import LoginHeader from "@/components/common/login-header";
import { authClient } from "@/lib/auth-client";

export default function UserPage() {
  const session = authClient.useSession();

  return (
    <>
      <LoginHeader />
      {session?.data?.session ? (
        <div className="text-center min-h-screen mt-10">
          <p className="mb-10">事前登録ありがとうございます！</p>
          <p className="mb-10">ログイン中: {session.data.user.email}</p>
          <SignOut />
        </div>
      ) : (
        <div className="text-center mt-10">
          <h1 className="mb-10">ログインしてください</h1>
          <SignIn />
        </div>
      )}
    </>
  );
}
