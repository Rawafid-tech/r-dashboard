import { Building2, CreditCard, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const POINTS = [
  { key: "plans", icon: CreditCard },
  { key: "companies", icon: Building2 },
  { key: "users", icon: Users },
  { key: "moderation", icon: ShieldCheck },
] as const;

export function AdminAuthBrandPanel() {
  const { t } = useTranslation("admin");

  return (
    <aside
      className="relative isolate flex h-full min-h-dvh flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#020617_0%,#1e1b4b_42%,#4338ca_100%)] px-8 py-8 text-white md:px-12 md:py-10"
      aria-label={t("brand.eyebrow")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <div className="auth-flow-line absolute -start-10 top-[16%] h-px w-[140%] rotate-[-10deg] bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />
        <div className="auth-flow-line auth-flow-line-delay absolute -start-16 top-[40%] h-px w-[150%] rotate-[7deg] bg-gradient-to-r from-transparent via-amber-300/55 to-transparent" />
        <div className="auth-flow-line auth-flow-line-delay-2 absolute -start-8 top-[66%] h-px w-[130%] rotate-[-5deg] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="absolute -bottom-24 -end-16 size-64 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -top-20 -start-10 size-56 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
            aria-hidden="true"
          >
            <ShieldCheck className="size-5 text-amber-200" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight">
              {t("brand.eyebrow")}
            </p>
            <p className="text-xs text-violet-100/80">{t("brand.badge")}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="text-2xl font-bold leading-snug tracking-tight lg:text-3xl">
          {t("brand.headline")}
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-violet-50/90">
          {t("brand.description")}
        </p>

        <ul className="mt-5 space-y-2">
          {POINTS.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex items-center gap-2.5 rounded-lg bg-white/8 px-3 py-2 ring-1 ring-white/10 backdrop-blur-[2px]"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-amber-400/20 text-amber-100">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-sm leading-snug text-violet-50">
                {t(`brand.points.${key}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-violet-100/60">
        {t("brand.footer")}
      </p>
    </aside>
  );
}
