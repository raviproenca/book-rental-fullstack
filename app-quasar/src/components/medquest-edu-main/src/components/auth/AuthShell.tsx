import type { ReactNode } from "react";
import { AuthAtmosphere } from "./AuthAtmosphere";

type AuthShellProps = {
  children: ReactNode;
  /** Tailwind max-width on the card column (e.g. max-w-md, max-w-lg) */
  maxWidthClass?: string;
  className?: string;
};

export function AuthShell({
  children,
  maxWidthClass = "max-w-md",
  className = "",
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <AuthAtmosphere />
      <div className={`relative z-10 w-full ${maxWidthClass} ${className}`}>
        <div className="rounded-2xl border border-border/60 bg-card/75 p-8 shadow-xl shadow-black/15 ring-1 ring-white/[0.06] backdrop-blur-xl dark:bg-card/65 dark:shadow-black/50 sm:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}
