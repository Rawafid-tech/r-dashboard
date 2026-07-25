import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";

interface UsersHeroProps {
  totalElements?: number;
}

export function UsersHero({ totalElements }: UsersHeroProps) {
  const { t } = useTranslation("admin");

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#059669_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8"
      aria-labelledby="users-hero-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <Badge variant="secondary" className="gap-1 uppercase">
            <Users className="size-3" aria-hidden="true" />
            {t("users.hero.badge")}
          </Badge>
          <h1
            id="users-hero-title"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t("users.hero.title")}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("users.hero.subtitle")}
          </p>
        </div>

        {typeof totalElements === "number" ? (
          <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-end backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("users.hero.totalLabel")}
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
