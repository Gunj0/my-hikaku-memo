"use client";

import { LogInIcon, PlusCircleIcon, type LucideIcon } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

function getDisplayName(name: string | null | undefined) {
  return name?.trim() || "ユーザー";
}

function getInitials(name: string | null | undefined) {
  return getDisplayName(name).slice(0, 2).toUpperCase();
}

export function AppHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const navItems: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/memos/new", label: "新規メモ", icon: PlusCircleIcon },
  ];

  if (pathname === "/memos/new") {
    return null;
  }

  const handleSignIn = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    await signIn("google", { redirectTo: currentPath });
  };

  return (
    <header className="border-b border-border/80 bg-background/88 backdrop-blur-md">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 md:gap-6">
          <div className="min-w-0 shrink-0">
            <Link href="/">
              <p className="flex items-center gap-2 text-base font-semibold tracking-wider text-foreground">
                <Image
                  src="/icon.svg"
                  alt="My Hikaku Memo"
                  width={128}
                  height={128}
                  className="text-center h-7 w-7"
                />
                オレの比較メモ β
              </p>
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-1 transition-colors text-foreground hover:text-foreground/80"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <Link
                href="/memos"
                className="items-center gap-2 rounded-md px-2.5 py-1.5 text-left md:flex"
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
            </>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  disabled={isLoading}
                  className="shrink-0"
                >
                  <LogInIcon className="h-4 w-4" />
                  ログイン
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <p className="flex items-center text-center text-foreground mx-auto mb-5">
                    <Image
                      src="/icon.svg"
                      alt="My Hikaku Memo"
                      width={48}
                      height={48}
                      className="text-center mr-2"
                    />
                    <span className="text-xl font-bold">オレの比較メモ β</span>
                  </p>
                  <DialogTitle>無料で作り始められます</DialogTitle>
                  <DialogDescription>
                    ログインすると、比較メモを保存して見返すことができます。
                  </DialogDescription>
                </DialogHeader>
                <Button
                  onClick={() => void handleSignIn()}
                  disabled={isLoading}
                  className="w-full"
                >
                  <LogInIcon className="h-4 w-4" />
                  Googleでログイン
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
