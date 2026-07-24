import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

interface BillingHeroProps {
  planName?: string;
  className?: string;
}

export function BillingHero({ planName, className }: BillingHeroProps) {
  const { t } = useTranslation("billing");

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
      aria-labelledby="billing-hero-title"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/15">
        <CreditCard className="size-3.5" aria-hidden="true" />
        {t("hero.eyebrow")}
      </div>
      <h1
        id="billing-hero-title"
        className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {t("hero.title")}
      </h1>
      {planName ? (
        <p className="mt-1 text-sm font-medium text-foreground">{planName}</p>
      ) : null}
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t("hero.description")}
      </p>
    </section>
  );
}
