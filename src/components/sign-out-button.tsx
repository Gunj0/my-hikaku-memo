"use client";

import { signOut } from "next-auth/react";
import * as React from "react";

import { Button } from "@/components/ui/button";

type SignOutButtonProps = React.ComponentProps<typeof Button> & {
  redirectTo?: string;
};

export function SignOutButton({
  children,
  redirectTo = "/",
  onClick,
  ...props
}: SignOutButtonProps) {
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    await signOut({ redirectTo });
  };

  return (
    <Button {...props} onClick={(event) => void handleClick(event)}>
      {children}
    </Button>
  );
}
