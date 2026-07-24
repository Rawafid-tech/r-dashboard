import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, Skeleton } from "@/shared/components/ui";

function SettingsFormFieldsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={
            index === 0 ? "grid gap-4 sm:grid-cols-2" : "space-y-2"
          }
        >
          {index === 0 ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : (
            <Skeleton className="h-9 w-full" />
          )}
        </div>
      ))}
      <div className="flex justify-end border-t border-border/60 pt-4">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

function SettingsSectionCardSkeleton({
  fieldRows = 3,
}: {
  fieldRows?: number;
}) {
  return (
    <Card className="border-border/80 shadow-sm" aria-hidden="true">
      <CardHeader className="gap-3 border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-4/5 max-w-sm" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <SettingsFormFieldsSkeleton rows={fieldRows} />
      </CardContent>
    </Card>
  );
}

function SettingsNavSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="hidden space-y-1 lg:block">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex gap-2 overflow-hidden lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function SettingsHeroSkeleton() {
  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-28 rounded-full" />
      <Skeleton className="mt-4 h-8 w-48 sm:h-9" />
      <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
      <Skeleton className="mt-2 h-4 w-5/6 max-w-2xl" />
    </section>
  );
}

export function SettingsPageSkeleton() {
  const { t } = useTranslation("settings");

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t("loading.label")}
    >
      <span className="sr-only">{t("loading.label")}</span>

      <SettingsHeroSkeleton />

      <div className="grid gap-6 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)] lg:items-start">
        <aside className="sticky top-[calc(3.5rem+0.75rem)] z-10 self-start lg:top-[calc(3.5rem+1rem)]">
          <SettingsNavSkeleton />
        </aside>

        <div className="space-y-6">
          <SettingsSectionCardSkeleton fieldRows={3} />
          <SettingsSectionCardSkeleton fieldRows={4} />
          <SettingsSectionCardSkeleton fieldRows={3} />
          <SettingsSectionCardSkeleton fieldRows={4} />
        </div>
      </div>
    </div>
  );
}
