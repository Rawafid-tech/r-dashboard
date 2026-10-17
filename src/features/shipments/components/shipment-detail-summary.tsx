import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { ShipmentIssueBadge } from "@/features/shipments/components/shipment-issue-badge";
import { formatPickupLocationLabel } from "@/features/shipments/lib/pickup-label";
import { shipmentCarrierLabel } from "@/features/shipments/lib/shipment-connection-label";
import { isReturnPickup } from "@/features/shipments/lib/shipment-kind";
import type { Shipment } from "@/features/shipments/types";
import { useSettings } from "@/features/account/hooks/use-settings";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";

interface ShipmentDetailSummaryProps {
  shipment: Shipment;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

export function ShipmentDetailSummary({ shipment }: ShipmentDetailSummaryProps) {
  const { t } = useTranslation("shipments");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const settingsQuery = useSettings();
  const dateFormat = settingsQuery.data?.dateFormat ?? "DD_MM_YYYY";

  const formatWhen = (iso: string | null) =>
    iso ? formatDateTime(iso, dateFormat, intlLocale) : "—";

  return (
    <section
      className="rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5"
      aria-labelledby="shipment-summary-heading"
    >
      <h2 id="shipment-summary-heading" className="mb-4 text-sm font-semibold">
        {t("detail.summary.title")}
      </h2>
      <dl className="space-y-3">
        <DetailRow label={t("detail.summary.order")}>
          <Link
            to={`/orders?search=${encodeURIComponent(shipment.order.orderNumber)}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {shipment.order.orderNumber}
          </Link>
        </DetailRow>
        <DetailRow label={t("detail.summary.receiver")}>
          <span>
            {shipment.receiverName}
            <span className="mt-0.5 block text-xs font-normal tabular-nums text-muted-foreground">
              {shipment.receiverPhone}
            </span>
          </span>
        </DetailRow>
        <DetailRow label={t("detail.summary.connection")}>
          <span className="flex items-center gap-2">
            <CarrierMark
              code={shipment.connection.carrierCode}
              name={shipmentCarrierLabel(shipment.connection, locale)}
            />
            {shipment.connection.name}
          </span>
        </DetailRow>
        {shipment.pickup ? (
          <DetailRow
            label={
              isReturnPickup(shipment)
                ? t("detail.summary.returnedTo")
                : t("detail.summary.collectedFrom")
            }
          >
            {formatPickupLocationLabel(shipment.pickup)}
          </DetailRow>
        ) : null}
        {isReturnPickup(shipment) ? (
          shipment.returnPickup?.refundAmount != null &&
          shipment.returnPickup.refundAmount > 0 ? (
            <DetailRow label={t("detail.summary.refundAtPickup")}>
              {formatCurrency(
                shipment.returnPickup.refundAmount,
                "EGP",
                intlLocale,
              )}
            </DetailRow>
          ) : null
        ) : (
          <DetailRow label={t("detail.summary.cod")}>
            {formatCurrency(shipment.codAmount, "EGP", intlLocale)}
          </DetailRow>
        )}
        {typeof shipment.attempts === "number" ? (
          <DetailRow label={t("detail.summary.attempts")}>
            {shipment.attempts.toLocaleString(intlLocale)}
          </DetailRow>
        ) : null}
        {shipment.issue ? (
          <DetailRow label={t("detail.summary.issue")}>
            <ShipmentIssueBadge issue={shipment.issue} />
          </DetailRow>
        ) : null}
        <DetailRow label={t("detail.summary.bookedAt")}>
          <time dateTime={shipment.bookedAt ?? undefined}>
            {formatWhen(shipment.bookedAt)}
          </time>
        </DetailRow>
        <DetailRow label={t("detail.summary.pickedUpAt")}>
          <time dateTime={shipment.pickedUpAt ?? undefined}>
            {formatWhen(shipment.pickedUpAt)}
          </time>
        </DetailRow>
        <DetailRow label={t("detail.summary.deliveredAt")}>
          <time dateTime={shipment.deliveredAt ?? undefined}>
            {formatWhen(shipment.deliveredAt)}
          </time>
        </DetailRow>
        <DetailRow label={t("detail.summary.returnedAt")}>
          <time dateTime={shipment.returnedAt ?? undefined}>
            {formatWhen(shipment.returnedAt)}
          </time>
        </DetailRow>
        <DetailRow label={t("detail.summary.lastUpdateAt")}>
          <time dateTime={shipment.lastUpdateAt ?? undefined}>
            {formatWhen(shipment.lastUpdateAt)}
          </time>
        </DetailRow>
      </dl>
    </section>
  );
}
