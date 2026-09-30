import { useTranslation } from "react-i18next";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import { useAdminCarriers } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { useUpdateAdminCarrier } from "@/features/admin/carriers/hooks/use-update-admin-carrier";
import type { AdminCarrier } from "@/features/admin/carriers/types";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge, Button, Skeleton, Switch } from "@/shared/components/ui";
import { AdminRole } from "@/shared/types/enums";

export function AdminCarriersHome() {
  const { t, i18n } = useTranslation("admin");
  const carriersQuery = useAdminCarriers();
  const updateMutation = useUpdateAdminCarrier();
  const { data: admin } = useAdminMe();
  const canManage = admin?.role === AdminRole.SUPER_ADMIN;
  const carriers = carriersQuery.data ?? [];
  const pendingCode = updateMutation.isPending
    ? (updateMutation.variables?.code ?? null)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#admin-carriers-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("carriers.skipToContent")}
      </a>

      <PageHeader
        title={t("carriers.hero.title")}
        description={t("carriers.hero.subtitle")}
      />

      <div id="admin-carriers-main">
        {carriersQuery.isLoading && !carriersQuery.data ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {carriersQuery.isError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-5"
          >
            <p className="font-medium text-destructive">
              {t("carriers.errors.loadFailed")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("carriers.errors.loadFailedHint")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void carriersQuery.refetch()}
            >
              {t("carriers.errors.retry")}
            </Button>
          </div>
        ) : null}

        {!carriersQuery.isLoading &&
        !carriersQuery.isError &&
        carriers.length === 0 ? (
          <p
            role="status"
            className="rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground"
          >
            {t("carriers.empty")}
          </p>
        ) : null}

        {!carriersQuery.isError && carriers.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-label={t("carriers.listLabel")}>
            {carriers.map((carrier) => (
              <CarrierRow
                key={carrier.code}
                carrier={carrier}
                locale={i18n.language}
                canManage={canManage}
                pending={pendingCode === carrier.code}
                onToggle={(enabled) =>
                  updateMutation.mutate({ code: carrier.code, enabled })
                }
              />
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function CarrierRow({
  carrier,
  locale,
  canManage,
  pending,
  onToggle,
}: {
  carrier: AdminCarrier;
  locale: string;
  canManage: boolean;
  pending: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const { t } = useTranslation("admin");
  const name = carrierDisplayName(
    {
      code: carrier.code,
      nameEn: carrier.nameEn ?? "",
      nameAr: carrier.nameAr ?? "",
    },
    locale,
  );
  const hintId = `admin-carrier-${carrier.code}-hint`;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
      <CarrierMark code={carrier.code} name={name} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground" dir="ltr">
          {carrier.code}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={carrier.running ? "success" : "warning"}>
          {carrier.running ? t("carriers.running") : t("carriers.notRunning")}
        </Badge>
        <Badge variant={carrier.enabled ? "success" : "muted"}>
          {carrier.enabled ? t("carriers.enabled") : t("carriers.disabled")}
        </Badge>
        <Switch
          checked={carrier.enabled}
          disabled={!canManage || pending}
          onCheckedChange={onToggle}
          aria-label={t(
            carrier.enabled ? "carriers.disable" : "carriers.enable",
            { name },
          )}
          aria-describedby={hintId}
        />
      </div>
      <p id={hintId} className="text-xs text-muted-foreground sm:max-w-xs">
        {!carrier.running
          ? t("carriers.notRunningHint")
          : canManage
            ? t("carriers.manageHint")
            : t("carriers.readOnlyHint")}
      </p>
    </li>
  );
}
