import { useState } from "react";
import { ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CarrierDeleteDialog } from "@/features/admin/carriers/components/carrier-delete-dialog";
import { CarrierFormDialog } from "@/features/admin/carriers/components/carrier-form-dialog";
import { CarrierLogoUploader } from "@/features/admin/carriers/components/carrier-logo-uploader";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import { useAdminCarriers } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { isCatalogManagedPlatform } from "@/features/admin/carriers/lib/admin-carrier-settings";
import { useUpdateAdminCarrier } from "@/features/admin/carriers/hooks/use-update-admin-carrier";
import type { AdminCarrier } from "@/features/admin/carriers/types";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge, Button, Skeleton, Switch } from "@/shared/components/ui";
import { AdminRole } from "@/shared/types/enums";

function isCatalogManagedCarrier(carrier: AdminCarrier): boolean {
  return isCatalogManagedPlatform(carrier.platform);
}

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

  const [createOpen, setCreateOpen] = useState(false);
  const [editCarrier, setEditCarrier] = useState<AdminCarrier | null>(null);
  const [deleteCarrier, setDeleteCarrier] = useState<AdminCarrier | null>(null);

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
        actions={
          canManage ? (
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              {t("carriers.addCarrier")}
            </Button>
          ) : null
        }
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
          <ul
            className="grid gap-4 lg:grid-cols-2"
            aria-label={t("carriers.listLabel")}
          >
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
                onEdit={() => setEditCarrier(carrier)}
                onDelete={() => setDeleteCarrier(carrier)}
              />
            ))}
          </ul>
        ) : null}
      </div>

      <CarrierFormDialog
        mode="create"
        carrier={null}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <CarrierFormDialog
        mode="edit"
        carrier={editCarrier}
        open={Boolean(editCarrier)}
        onOpenChange={(open) => {
          if (!open) setEditCarrier(null);
        }}
      />
      <CarrierDeleteDialog
        carrier={deleteCarrier}
        locale={i18n.language}
        open={Boolean(deleteCarrier)}
        onOpenChange={(open) => {
          if (!open) setDeleteCarrier(null);
        }}
      />
    </div>
  );
}

function CarrierRow({
  carrier,
  locale,
  canManage,
  pending,
  onToggle,
  onEdit,
  onDelete,
}: {
  carrier: AdminCarrier;
  locale: string;
  canManage: boolean;
  pending: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
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
  const switchId = `admin-carrier-${carrier.code}-enabled`;
  const catalogManaged = isCatalogManagedCarrier(carrier);
  const hint = !carrier.running
    ? t("carriers.notRunningHint")
    : canManage
      ? t("carriers.manageHint")
      : t("carriers.readOnlyHint");

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex flex-1 gap-4 p-4">
        {canManage ? (
          <CarrierLogoUploader
            code={carrier.code}
            name={name}
            logoUrl={carrier.logoUrl}
            stacked
          />
        ) : (
          <CarrierMark
            code={carrier.code}
            name={name}
            logoUrl={carrier.logoUrl}
            className="size-12 shrink-0 text-sm"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-snug text-foreground">
              {name}
            </p>
            <p
              className="mt-0.5 w-fit font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              dir="ltr"
            >
              {carrier.code}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {carrier.platform ? (
              <Badge variant="outline">{carrier.platform}</Badge>
            ) : null}
            <Badge variant={carrier.running ? "success" : "warning"}>
              {carrier.running
                ? t("carriers.running")
                : t("carriers.notRunning")}
            </Badge>
            <Badge variant={carrier.enabled ? "success" : "muted"}>
              {carrier.enabled
                ? t("carriers.enabled")
                : t("carriers.disabled")}
            </Badge>
            {carrier.settings?.returns === "true" ? (
              <Badge variant="outline">{t("carriers.returnsOn")}</Badge>
            ) : null}
          </div>
          <p
            id={hintId}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {hint}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              to={`/admin/carriers/${encodeURIComponent(carrier.code)}/regions`}
              aria-label={t("carriers.viewRegions", { name })}
            >
              {t("carriers.viewRegionsShort")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          {canManage && catalogManaged ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                aria-label={t("carriers.form.editAction", { name })}
              >
                <Pencil aria-hidden="true" />
                {t("carriers.form.editShort")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDelete}
                aria-label={t("carriers.form.deleteAction", { name })}
              >
                <Trash2 aria-hidden="true" />
                {t("carriers.form.deleteShort")}
              </Button>
            </>
          ) : null}
        </div>
        <Switch
          id={switchId}
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
    </li>
  );
}
