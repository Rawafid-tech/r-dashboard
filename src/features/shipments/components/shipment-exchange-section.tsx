import { useTranslation } from "react-i18next";
import { isExchange } from "@/features/shipments/lib/shipment-kind";
import type { Shipment } from "@/features/shipments/types";
import { useSettings } from "@/features/account/hooks/use-settings";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";

interface ShipmentExchangeSectionProps {
  shipment: Shipment;
}

export function ShipmentExchangeSection({
  shipment,
}: ShipmentExchangeSectionProps) {
  const { t } = useTranslation("shipments");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const settingsQuery = useSettings();
  const dateFormat = settingsQuery.data?.dateFormat ?? "DD_MM_YYYY";

  if (!isExchange(shipment) || !shipment.exchange) {
    return null;
  }

  const { exchange } = shipment;

  return (
    <section
      className="rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5"
      aria-labelledby="shipment-exchange-heading"
    >
      <h2 id="shipment-exchange-heading" className="mb-4 text-sm font-semibold">
        {t("detail.exchange.title")}
      </h2>
      <dl className="space-y-3 text-sm">
        {exchange.reason ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.exchange.reason")}</dt>
            <dd className="font-medium">{exchange.reason}</dd>
          </div>
        ) : null}
        {exchange.collectAmount != null && exchange.collectAmount > 0 ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.exchange.collect")}</dt>
            <dd className="font-medium tabular-nums">
              {formatCurrency(exchange.collectAmount, "EGP", intlLocale)}
            </dd>
          </div>
        ) : null}
        {exchange.refundAmount != null && exchange.refundAmount > 0 ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.exchange.refund")}</dt>
            <dd className="font-medium tabular-nums">
              {formatCurrency(exchange.refundAmount, "EGP", intlLocale)}
            </dd>
          </div>
        ) : null}
        {exchange.swappedAt ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.exchange.swappedAt")}</dt>
            <dd className="font-medium">
              <time dateTime={exchange.swappedAt}>
                {formatDateTime(exchange.swappedAt, dateFormat, intlLocale)}
              </time>
            </dd>
          </div>
        ) : null}
        {exchange.items.length > 0 ? (
          <div>
            <dt className="mb-2 text-muted-foreground">{t("detail.exchange.items")}</dt>
            <dd>
              <ul className="divide-y divide-border/60 rounded-md border border-border/60">
                {exchange.items.map((item) => (
                  <li
                    key={item.orderItemId}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                  >
                    <span className="font-medium">
                      {item.name}
                      {item.sku ? (
                        <span className="ms-1 text-xs font-normal text-muted-foreground">
                          ({item.sku})
                        </span>
                      ) : null}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      × {item.quantity.toLocaleString(intlLocale)}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {exchange.address ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.exchange.address")}</dt>
            <dd className="font-medium">
              {exchange.address.addressLine}
              {exchange.address.phone ? (
                <span
                  dir="ltr"
                  className="mt-0.5 block text-xs font-normal tabular-nums text-muted-foreground"
                >
                  {exchange.address.phone}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
