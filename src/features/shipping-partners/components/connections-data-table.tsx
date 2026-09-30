import type { ReactNode } from "react";
import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { ConnectionRowActionsMenu } from "@/features/shipping-partners/components/connection-row-actions-menu";
import type { ConnectionRowAction } from "@/features/shipping-partners/components/connection-row-actions-menu";
import { ConnectionsToolbar } from "@/features/shipping-partners/components/connections-toolbar";
import {
  carrierDisplayName,
  credentialMask,
} from "@/features/shipping-partners/lib/carrier-label";
import type { ConnectionsSortOption } from "@/features/shipping-partners/lib/list-params";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { Badge, Button, Switch } from "@/shared/components/ui";

interface ConnectionsDataTableProps {
  connections: CarrierConnection[];
  search: string;
  sortOption: ConnectionsSortOption;
  activeOnly: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ConnectionsSortOption) => void;
  onActiveOnlyChange: (value: boolean) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (
    action: ConnectionRowAction,
    connection: CarrierConnection,
    opener: HTMLElement,
  ) => void;
  onToggle: (connection: CarrierConnection, active: boolean) => void;
  isCarrierAvailable: (code: string) => boolean;
  pendingToggleId?: string | null;
  canManage?: boolean;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

function formatVerified(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusControl({
  connection,
  canManage,
  carrierAvailable,
  pending,
  onToggle,
}: {
  connection: CarrierConnection;
  canManage: boolean;
  carrierAvailable: boolean;
  pending: boolean;
  onToggle: (connection: CarrierConnection, active: boolean) => void;
}) {
  const { t } = useTranslation("shippingPartners");
  const activateBlocked = !carrierAvailable && !connection.active;
  const hintId = `connection-status-hint-${connection.id}`;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2">
        <Badge variant={connection.active ? "success" : "muted"}>
          {connection.active ? t("table.active") : t("table.inactive")}
        </Badge>
        {canManage ? (
          <Switch
            checked={connection.active}
            disabled={pending || activateBlocked}
            onCheckedChange={(checked) => onToggle(connection, checked)}
            aria-label={t(
              connection.active ? "table.deactivate" : "table.activate",
              { name: connection.name },
            )}
            aria-describedby={activateBlocked ? hintId : undefined}
          />
        ) : null}
      </div>
      {activateBlocked ? (
        <p id={hintId} className="max-w-xs text-xs text-muted-foreground">
          {t("table.carrierDisabled")}
        </p>
      ) : null}
    </div>
  );
}

export function ConnectionsDataTable({
  connections,
  search,
  sortOption,
  activeOnly,
  onSearchChange,
  onSortChange,
  onActiveOnlyChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  onToggle,
  isCarrierAvailable,
  pendingToggleId,
  canManage = false,
  isFetching,
  emptyState,
}: ConnectionsDataTableProps) {
  const { t, i18n } = useTranslation(["shippingPartners", "common"]);

  const columns = useMemo<DataTableColumn<CarrierConnection>[]>(
    () => [
      {
        id: "name",
        header: t("table.name"),
        cell: (connection) => (
          <span className="flex items-center gap-2">
            <CarrierMark
              code={connection.carrier.code}
              name={carrierDisplayName(connection.carrier, i18n.language)}
              className="size-8"
            />
            <span className="font-medium text-foreground">{connection.name}</span>
          </span>
        ),
      },
      {
        id: "carrier",
        header: t("table.carrier"),
        cell: (connection) =>
          carrierDisplayName(connection.carrier, i18n.language),
      },
      {
        id: "credential",
        header: t("table.credential"),
        cell: (connection) => (
          <span dir="ltr" className="font-mono text-sm text-muted-foreground">
            {credentialMask(connection.credentialHint)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: (connection) => (
          <StatusControl
            connection={connection}
            canManage={canManage}
            carrierAvailable={isCarrierAvailable(connection.carrier.code)}
            pending={pendingToggleId === connection.id}
            onToggle={onToggle}
          />
        ),
      },
      {
        id: "verified",
        header: t("table.verified"),
        cell: (connection) =>
          connection.verifiedAt ? (
            <time dateTime={connection.verifiedAt} className="text-muted-foreground">
              {formatVerified(connection.verifiedAt, i18n.language)}
            </time>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [canManage, i18n.language, isCarrierAvailable, onToggle, pendingToggleId, t],
  );

  return (
    <DataTable
      data={connections}
      columns={columns}
      getRowKey={(connection) => connection.id}
      caption={t("table.caption")}
      minWidth="860px"
      isFetching={isFetching}
      toolbar={{
        title: t("toolbar.title"),
        render: () => (
          <ConnectionsToolbar
            search={search}
            sortOption={sortOption}
            activeOnly={activeOnly}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onActiveOnlyChange={onActiveOnlyChange}
            disabled={isFetching}
          />
        ),
      }}
      search={false}
      sort={false}
      filters={false}
      pagination={{
        page,
        totalPages,
        totalElements,
        pageSize,
        onPageChange,
        isFetching,
        labels: {
          previous: t("common:common.previous"),
          next: t("common:common.next"),
          summary: ({ start, end, total }) =>
            t("pagination.summary", { start, end, total }),
          pageOf: ({ current, total }) =>
            t("pagination.pageOf", { current, total }),
          ariaLabel: t("pagination.label"),
        },
      }}
      mobile={{
        renderRow: (connection) => {
          const carrierName = carrierDisplayName(
            connection.carrier,
            i18n.language,
          );
          const canEdit = isCarrierAvailable(connection.carrier.code);
          return (
            <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <CarrierMark code={connection.carrier.code} name={carrierName} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">
                    {connection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{carrierName}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("table.credential")}</dt>
                  <dd dir="ltr" className="font-mono">
                    {credentialMask(connection.credentialHint)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("table.verified")}</dt>
                  <dd>
                    {connection.verifiedAt ? (
                      <time dateTime={connection.verifiedAt}>
                        {formatVerified(connection.verifiedAt, i18n.language)}
                      </time>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>
              <StatusControl
                connection={connection}
                canManage={canManage}
                carrierAvailable={canEdit}
                pending={pendingToggleId === connection.id}
                onToggle={onToggle}
              />
              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) =>
                        onRowAction("edit", connection, event.currentTarget)
                      }
                    >
                      <Pencil aria-hidden="true" />
                      {t("table.edit")}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) =>
                      onRowAction("remove", connection, event.currentTarget)
                    }
                  >
                    <Trash2 aria-hidden="true" />
                    {t("table.remove")}
                  </Button>
                </div>
              ) : null}
            </article>
          );
        },
      }}
      rowActions={
        canManage
          ? (connection) => (
              <ConnectionRowActionsMenu
                connection={connection}
                canEdit={isCarrierAvailable(connection.carrier.code)}
                onAction={(action, row) => {
                  const opener = document.activeElement;
                  onRowAction(
                    action,
                    row,
                    opener instanceof HTMLElement ? opener : document.body,
                  );
                }}
              />
            )
          : undefined
      }
      actionsColumnHeader={
        canManage ? (
          <span className="sr-only">{t("table.actions")}</span>
        ) : undefined
      }
      emptyState={emptyState}
    />
  );
}
