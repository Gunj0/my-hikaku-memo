"use client";

import LoginHeader from "@/components/common/login-header";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const session = authClient.useSession();

  return (
    <>
      <LoginHeader />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        当サイトは準備中です
      </main>
    </>
  );
}
