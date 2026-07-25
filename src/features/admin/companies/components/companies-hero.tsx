import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";

interface CompaniesHeroProps {
  totalElements?: number;
}

export function CompaniesHero({ totalElements }: CompaniesHeroProps) {
  const { t } = useTranslation("admin");

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#7c3aed_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8"
      aria-labelledby="companies-hero-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <Badge variant="secondary" className="gap-1 uppercase">
            <Building2 className="size-3" aria-hidden="true" />
            {t("companies.hero.badge")}
          </Badge>
          <h1
            id="companies-hero-title"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t("companies.hero.title")}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("companies.hero.subtitle")}
          </p>
        </div>

        {typeof totalElements === "number" ? (
          <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-end backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("companies.hero.totalLabel")}
            </p>
            <p
              dir="ltr"
              className="mt-1 text-2xl font-bold tabular-nums text-foreground"
            >
              {totalElements.toLocaleString()}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
