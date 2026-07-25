import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminAuthBrandPanel } from "@/features/admin/auth/components/admin-auth-brand-panel";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { AdminLoginForm } from "@/features/admin/auth/login";

export function AdminLoginPage() {
  const { t } = useTranslation("admin");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("login.metaTitle");

    const description = t("login.metaDescription");
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = description;

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t]);

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#admin-login-form"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("login.title")}
      </a>

      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AdminAuthBrandPanel />
        </div>

        <div className="relative flex flex-col bg-[radial-gradient(1200px_600px_at_0%_-10%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent),radial-gradient(900px_500px_at_100%_100%,color-mix(in_oklab,#7c3aed_12%,transparent),transparent)]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
            <div className="flex items-center gap-2 lg:invisible lg:pointer-events-none">
              <span
                className="grid size-9 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:text-violet-300"
                aria-hidden="true"
              >
                <svg viewBox="0 0 32 32" className="size-5" fill="none">
                  <path
                    d="M16 4L26 9V16C26 22 21 27 16 28C11 27 6 22 6 16V9L16 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16L15 19L21 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-foreground">
                  {t("brand.eyebrow")}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {t("brand.badge")}
                </p>
              </div>
            </div>
            <AuthLocaleThemeControls />
          </div>

          <main className="flex flex-1 items-start justify-center px-4 pb-6 pt-1 sm:px-8 sm:pb-8 lg:items-center lg:py-4">
            <div
              id="admin-login-form"
              className="w-full max-w-md rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-foreground/8 backdrop-blur-sm sm:p-6"
            >
              <AdminLoginForm />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
