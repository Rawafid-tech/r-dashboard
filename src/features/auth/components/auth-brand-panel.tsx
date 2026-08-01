import { CircleCheck, Package, RefreshCcw, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RawafidLogoMark } from "@/shared/components/layout/rawafid-logo-mark";

const POINTS = [
  { key: "shipments", icon: Package },
  { key: "returns", icon: RefreshCcw },
  { key: "wallet", icon: Wallet },
  { key: "freePlan", icon: CircleCheck },
] as const;

export function AuthBrandPanel() {
  const { t } = useTranslation(["auth", "common"]);

  return (
    <aside
      className="auth-brand-surface flex h-full min-h-dvh flex-col"
      aria-label={t("brand.eyebrow")}
    >
      <div className="flex flex-1 flex-col justify-between px-10 py-10 md:px-12 md:py-12">
        <div className="flex items-center gap-3">
          <RawafidLogoMark className="auth-brand-icon-chip size-10 ring-1 ring-[var(--auth-brand-border)]" />
          <div>
            <p className="text-base font-semibold tracking-tight">
              {t("brand.eyebrow")}
            </p>
            <p className="auth-brand-muted text-xs">{t("common:app.tagline")}</p>
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

        <p className="auth-brand-subtle text-xs">rawafid.softizone.net</p>
      </div>
    </aside>
  );
}
