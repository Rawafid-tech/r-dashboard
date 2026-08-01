import type { ReactNode } from "react";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { cn } from "@/shared/lib/utils";

interface AuthPageLayoutProps {
  skipHref: string;
  skipLabel: string;
  formPanelId: string;
  /** Full-height panel on large screens (start side) */
  brandPanel: ReactNode;
  /** Logo block above the form on small screens */
  mobileBrand: ReactNode;
  children: ReactNode;
  formMaxWidthClassName?: string;
}

export function AuthPageLayout({
  skipHref,
  skipLabel,
  formPanelId,
  brandPanel,
  mobileBrand,
  children,
  formMaxWidthClassName = "max-w-[26rem]",
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href={skipHref}
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {skipLabel}
      </a>

      <div className="grid min-h-dvh lg:grid-cols-2">
        <div className="hidden lg:block">{brandPanel}</div>

        <div className="flex min-h-dvh flex-col bg-background">
          <header className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4 sm:px-6">
            <AuthLocaleThemeControls />
          </header>

          <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
            <div
              className={cn("flex w-full flex-col gap-8", formMaxWidthClassName)}
            >
              <div className="lg:hidden">{mobileBrand}</div>

              <div
                id={formPanelId}
                className="auth-form-panel w-full rounded-lg p-6 sm:p-8"
              >
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
