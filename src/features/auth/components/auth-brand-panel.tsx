import { Package, RefreshCcw, Wallet, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const POINTS = [
  { key: "shipments", icon: Package },
  { key: "returns", icon: RefreshCcw },
  { key: "wallet", icon: Wallet },
  { key: "freePlan", icon: Sparkles },
] as const;

export function AuthBrandPanel() {
  const { t } = useTranslation("auth");

  return (
    <aside
      className="relative isolate flex h-full min-h-dvh flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_48%,#2563eb_100%)] px-8 py-8 text-white md:px-12 md:py-10"
      aria-label={t("brand.eyebrow")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <div className="auth-flow-line absolute -start-10 top-[18%] h-px w-[140%] rotate-[-8deg] bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
        <div className="auth-flow-line auth-flow-line-delay absolute -start-16 top-[42%] h-px w-[150%] rotate-[6deg] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <div className="auth-flow-line auth-flow-line-delay-2 absolute -start-8 top-[68%] h-px w-[130%] rotate-[-4deg] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute -bottom-24 -end-16 size-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -top-20 -start-10 size-56 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
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
          <p className="text-lg font-bold tracking-tight">{t("brand.eyebrow")}</p>
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="text-2xl font-bold leading-snug tracking-tight lg:text-3xl">
          {t("brand.headline")}
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-sky-50/90">
          {t("brand.description")}
        </p>

        <ul className="mt-5 space-y-2">
          {POINTS.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex items-center gap-2.5 rounded-lg bg-white/8 px-3 py-2 ring-1 ring-white/10 backdrop-blur-[2px]"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-emerald-400/20 text-emerald-200">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-sm leading-snug text-sky-50">
                {t(`brand.points.${key}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-sky-100/60">
        rawafid.softizone.net
      </p>
    </aside>
  );
}
