"use client";

import { cn } from "@/lib/utils";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

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
  const navItems = [
    { href: "/memos/new", label: "新規作成" },
    { href: "/memos", label: "マイメモ" },
  ];

  const handleSignIn = async () => {
    await signIn("google", { redirectTo: currentPath });
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  return (
    <header className="border-b border-border/80 bg-background/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
              My Hikaku Memo
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-semibold tracking-wider text-foreground transition-opacity hover:opacity-80"
            >
              <span className="text-primary/80">[</span>
              オレの比較メモ
              <span className="text-primary/80">]</span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-sm border px-2 py-1 transition-colors",
                    isActive
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/80 bg-card/80 hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
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
