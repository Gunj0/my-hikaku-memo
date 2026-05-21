"use client";

import { LogInIcon, LogOutIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const handleSignIn = async () => {
    await signIn("google", { redirectTo: "/" });
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  return (
    <header className="border-b border-border/80 bg-background/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
            My Hikaku Memo
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-[0.05em] text-foreground transition-opacity hover:opacity-80"
          >
            <span className="text-primary/80">[</span>
            オレの比較メモ
            <span className="text-primary/80">]</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-sm border border-border/80 bg-card/80 px-2 py-1 text-[10px] tracking-[0.18em] text-muted-foreground md:inline-flex">
            {isAuthenticated ? "SESSION:LIVE" : "SESSION:GUEST"}
          </span>
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSignOut()}
              disabled={isLoading}
              className="shrink-0"
            >
              <LogOutIcon className="h-4 w-4" />
              ログアウト
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSignIn()}
              disabled={isLoading}
              className="shrink-0"
            >
              <LogInIcon className="h-4 w-4" />
              Googleでログイン
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
