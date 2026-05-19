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
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-lg font-semibold text-foreground transition-opacity hover:opacity-80"
          >
            オレの比較メモ
          </Link>
          {isAuthenticated && (
            <p className="truncate text-sm text-muted-foreground">
              {session.user?.name ?? session.user?.email ?? "Googleアカウント"}
            </p>
          )}
        </div>

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
    </header>
  );
}
