"use client";

import {
  BookMarkedIcon,
  LogInIcon,
  LogOutIcon,
  PlusCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const COMPARISON_AUTH_REDIRECT_EVENT = "gadget-comparison:before-sign-in";

function getDisplayName(name: string | null | undefined) {
  return name?.trim() || "ユーザー";
}

function getInitials(name: string | null | undefined) {
  return getDisplayName(name).slice(0, 2).toUpperCase();
}

export function AppHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const currentPath = (() => {
    const query = searchParams.toString();

    return query ? `${pathname}?${query}` : pathname;
  })();
  const navItems: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/memos/new", label: "新規作成", icon: PlusCircleIcon },
    { href: "/memos", label: "マイメモ", icon: BookMarkedIcon },
  ];

  const handleSignIn = async () => {
    if (typeof window !== "undefined" && pathname === "/memos/new") {
      window.dispatchEvent(new Event(COMPARISON_AUTH_REDIRECT_EVENT));
    }

    await signIn("google", { redirectTo: currentPath });
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  return (
    <header className="border-b border-border/80 bg-background/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 md:gap-6">
          <div className="min-w-0 shrink-0">
            <Link href="/">
              <p className="text-[10px] tracking-[0.20em] text-muted-foreground">
                My Hikaku Memo
              </p>
              <p className="inline-flex items-center gap-2 text-base font-semibold tracking-wider text-foreground">
                オレの比較メモ
              </p>
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className="inline-flex items-center gap-1 rounded-sm border px-2 py-1 transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {isAuthenticated ? (
            <>
              <Link
                href="/memos"
                className="items-center gap-2 rounded-md bg-card/70 px-2.5 py-1.5 text-left md:flex"
              >
                <Avatar className="size-8 border border-border/70">
                  <AvatarImage
                    src={session?.user?.image ?? undefined}
                    alt={getDisplayName(session?.user?.name)}
                  />
                  <AvatarFallback>
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
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
            </>
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
