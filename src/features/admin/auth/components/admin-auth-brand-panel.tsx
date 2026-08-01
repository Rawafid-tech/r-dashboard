import { Building2, CreditCard, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminConsoleMark } from "@/shared/components/layout/admin-console-mark";

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
      className="auth-brand-surface flex h-full min-h-dvh flex-col"
      aria-label={t("brand.eyebrow")}
    >
      <div className="flex flex-1 flex-col justify-between px-10 py-10 md:px-12 md:py-12">
        <div className="flex items-center gap-3">
          <AdminConsoleMark className="auth-brand-icon-chip size-10 text-[var(--auth-brand-fg)]" />
          <div>
            <p className="text-base font-semibold tracking-tight">
              {t("brand.eyebrow")}
            </p>
            <p className="auth-brand-muted text-xs">{t("brand.badge")}</p>
          </div>
        </div>

        <div className="max-w-md py-10">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight lg:text-[1.75rem]">
            {t("brand.headline")}
          </h2>
          <p className="auth-brand-muted mt-3 text-sm leading-relaxed">
            {t("brand.description")}
          </p>

          <ul className="auth-brand-feature-list mt-8 divide-y divide-[var(--auth-brand-divider)] overflow-hidden rounded-lg">
            {POINTS.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-start gap-3 px-4 py-3.5">
                <span className="auth-brand-icon-chip mt-0.5 grid size-8 shrink-0 place-items-center rounded-md">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm leading-snug">{t(`brand.points.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-subtle text-xs">{t("brand.footer")}</p>
      </div>
    </aside>
  );
}
