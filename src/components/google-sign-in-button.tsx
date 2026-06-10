import { Roboto } from "next/font/google";
import * as React from "react";

import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "500",
});

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="block h-5 w-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59C10.05 27.14 9.77 25.6 9.77 24s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

type GoogleSignInButtonProps = React.ComponentProps<"button">;

export function GoogleSignInButton({
  children,
  className,
  style,
  type = "button",
  ...props
}: GoogleSignInButtonProps) {
  const label = children ?? "Google でログイン";

  return (
    <button
      type={type}
      className={cn(
        roboto.className,
        "group relative inline-flex h-10 mx-auto w-50 max-w-100 min-w-min select-none appearance-none items-center overflow-hidden whitespace-nowrap border border-[#8e918f] bg-[#131314] px-3 text-center align-middle text-[14px] font-medium leading-5 tracking-[0.25px] text-[#e3e3e3] outline-none transition-[background-color,border-color,box-shadow] duration-218 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] focus-visible:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] disabled:cursor-default disabled:border-[#8e918f1f] disabled:bg-[#13131461]",
        className,
      )}
      style={{ borderRadius: 20, ...style }}
      {...props}
    >
      <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-218 group-hover:opacity-[0.08] group-focus-visible:opacity-[0.12] group-active:opacity-[0.12] group-disabled:bg-[#e3e3e31f] group-disabled:opacity-100" />
      <span className="relative flex h-full w-full items-center justify-between">
        <span className="min-w-5 h-5 w-5 shrink-0">
          <GoogleIcon />
        </span>
        <span className="grow overflow-hidden text-ellipsis font-medium group-disabled:opacity-[0.38]">
          {label}
        </span>
        <span className="hidden" aria-hidden="true">
          {label}
        </span>
      </span>
    </button>
  );
}
