import { CreditCard, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/shared/components/ui";

interface PlansHeroProps {
  totalPlans?: number;
  activeCount?: number;
  canManage?: boolean;
}

export function PlansHero({
  totalPlans,
  activeCount,
  canManage = false,
}: PlansHeroProps) {
  const { t } = useTranslation("admin");

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#7c3aed_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8"
      aria-labelledby="plans-hero-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <Badge variant="secondary" className="gap-1 uppercase">
            <CreditCard className="size-3" aria-hidden="true" />
            {t("plans.hero.badge")}
          </Badge>
          <h1
            id="plans-hero-title"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t("plans.hero.title")}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("plans.hero.subtitle")}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {typeof totalPlans === "number" ? (
            <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-end backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("plans.hero.totalLabel")}
              </p>
              <p
                dir="ltr"
                className="mt-1 text-2xl font-bold tabular-nums text-foreground"
              >
                {totalPlans.toLocaleString()}
              </p>
              {typeof activeCount === "number" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("plans.hero.activeCount", { count: activeCount })}
                </p>
              ) : null}
            </div>
          ) : null}

          {canManage ? (
            <Button asChild>
              <Link to="/admin/plans/new">
                <Plus aria-hidden="true" />
                {t("plans.hero.createPlan")}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
