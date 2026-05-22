"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type AuthSessionProviderProps = {
  session?: Session | null;
  children: React.ReactNode;
};

export function AuthSessionProvider({
  session,
  children,
}: AuthSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
