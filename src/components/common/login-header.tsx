import { SignIn } from "@/components/auth/sign-in";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import Title from "./title";

export default function LoginHeader() {
  // セッション取得
  const session = authClient.useSession();

  // ログインボタン付きヘッダー
  return (
    <header className="flex items-center h-16 border-b w-full justify-between">
      <Title />
      {!session?.data?.session ? (
        <div className="flex gap-2 items-center mx-3">
          <SignIn />
        </div>
      ) : (
        <div className="flex gap-2 items-center mx-6">
          {session.data.user.image && (
            <Link href="/user">
              <Image
                src={session.data.user.image}
                alt="User Avatar"
                width={30}
                height={30}
                className="rounded-full w-8 h-8 object-cover"
              />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
