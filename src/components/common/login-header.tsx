'use client";';

import { SignIn } from "@/components/auth/sign-in";
import { PATH } from "@/const/Path";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import Title from "./title";

export default function LoginHeader() {
  // セッション取得
  const session = authClient.useSession();

  return (
    <header className="flex items-center h-16 border-b w-full justify-between">
      <div className="mx-4">
        <Title />
      </div>
      {!session?.data ? (
        <div className="mx-4">
          <SignIn />
        </div>
      ) : (
        <div className="mx-4">
          {session.data.user.image && (
            <Link href={PATH.MEMO.LIST}>
              <Image
                src={session.data.user.image}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full w-10 h-10 object-cover border-2"
              />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
