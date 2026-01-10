"use client";

import LoginHeader from "@/components/common/login-header";

export default function MemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LoginHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
