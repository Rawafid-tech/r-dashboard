import { useTranslation } from "react-i18next";
import { isReturnPickup } from "@/features/shipments/lib/shipment-kind";
import type { Shipment } from "@/features/shipments/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";

interface ShipmentReturnPickupSectionProps {
  shipment: Shipment;
}

export function ShipmentReturnPickupSection({
  shipment,
}: ShipmentReturnPickupSectionProps) {
  const { t } = useTranslation("shipments");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  if (!isReturnPickup(shipment) || !shipment.returnPickup) {
    return null;
  }

  const { returnPickup } = shipment;

  return (
    <section
      className="rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5"
      aria-labelledby="shipment-return-pickup-heading"
    >
      <h2 id="shipment-return-pickup-heading" className="mb-4 text-sm font-semibold">
        {t("detail.returnPickup.title")}
      </h2>
      <dl className="space-y-3 text-sm">
        {returnPickup.reason ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.returnPickup.reason")}</dt>
            <dd className="font-medium">{returnPickup.reason}</dd>
          </div>
        ) : null}
        {returnPickup.refundAmount != null && returnPickup.refundAmount > 0 ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">{t("detail.returnPickup.refund")}</dt>
            <dd className="font-medium tabular-nums">
              {formatCurrency(returnPickup.refundAmount, "EGP", intlLocale)}
            </dd>
          </div>
        ) : null}
        {returnPickup.items.length > 0 ? (
          <div>
            <dt className="mb-2 text-muted-foreground">
              {t("detail.returnPickup.items")}
            </dt>
            <dd>
              <ul className="divide-y divide-border/60 rounded-md border border-border/60">
                {returnPickup.items.map((item) => (
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
        {returnPickup.pickupAddress ? (
          <div className="grid gap-1 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
            <dt className="text-muted-foreground">
              {t("detail.returnPickup.pickupAddress")}
            </dt>
            <dd className="font-medium">
              {returnPickup.pickupAddress.addressLine}
              {returnPickup.pickupAddress.phone ? (
                <span className="mt-0.5 block text-xs font-normal tabular-nums text-muted-foreground">
                  {returnPickup.pickupAddress.phone}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
