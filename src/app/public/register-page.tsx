import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { RegisterForm } from "@/features/auth/register";

export function RegisterPage() {
  const { t } = useTranslation("auth");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("register.metaTitle");

    const description = t("register.metaDescription");
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
        href="#register-form"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("register.title")}
      </a>

      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AuthBrandPanel />
        </div>

        <div className="relative flex flex-col bg-[radial-gradient(1200px_600px_at_100%_-10%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent),radial-gradient(900px_500px_at_0%_100%,color-mix(in_oklab,#22c55e_10%,transparent),transparent)]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
            <div className="flex items-center gap-2 lg:invisible lg:pointer-events-none">
              <span
                className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
                aria-hidden="true"
              >
                <svg viewBox="0 0 32 32" className="size-5" fill="none">
                  <path
                    d="M4 20c4-8 8-8 12 0s8 8 12 0"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 12c4-8 8-8 12 0s8 8 12 0"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-foreground">
                  {t("brand.eyebrow")}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {t("brand.headline")}
                </p>
              </div>
            </div>
            <AuthLocaleThemeControls />
          </div>

          <main className="flex flex-1 items-start justify-center px-4 pb-6 pt-1 sm:px-8 sm:pb-8 lg:items-center lg:py-4">
            <div
              id="register-form"
              className="w-full max-w-md rounded-xl bg-card/80 p-4 shadow-sm ring-1 ring-foreground/8 backdrop-blur-sm sm:p-6"
            >
              <RegisterForm />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
