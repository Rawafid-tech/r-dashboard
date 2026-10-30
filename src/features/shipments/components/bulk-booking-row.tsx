import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import { ShipmentDistrictCombobox } from "@/features/shipments/components/shipment-district-combobox";
import {
  ShipmentPickupInfo,
  ShipmentProblemAction,
} from "@/features/shipments/components/shipment-pickup-info";
import { getShipmentDistrictLabel } from "@/features/shipments/lib/district-label";
import type {
  BulkBookingLineDraft,
  BulkPreviewLine,
  ShipmentDistrict,
} from "@/features/shipments/types";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface BulkBookingRowProps {
  index: number;
  showIndex: boolean;
  draft: BulkBookingLineDraft;
  previewLine: BulkPreviewLine | undefined;
  connections: CarrierConnection[];
  selectedDistrict: ShipmentDistrict | null;
  connectionSelectId: string;
  districtSelectId: string;
  canEditPackages: boolean;
  showDefaultPickupWarning: boolean;
  disabled?: boolean;
  onConnectionChange: (connectionId: string) => void;
  onDistrictChange: (district: ShipmentDistrict | null) => void;
  onSuggestionPick: (district: ShipmentDistrict) => void;
  onEditPackages: () => void;
  onRemove: () => void;
  onEditOrder: () => void;
}

export function BulkBookingRow({
  index,
  showIndex,
  draft,
  previewLine,
  connections,
  selectedDistrict,
  connectionSelectId,
  districtSelectId,
  canEditPackages,
  showDefaultPickupWarning,
  disabled,
  onConnectionChange,
  onDistrictChange,
  onSuggestionPick,
  onEditPackages,
  onRemove,
  onEditOrder,
}: BulkBookingRowProps) {
  const { t } = useTranslation(["shipments", "orders"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const order = previewLine?.order;
  const title = order?.orderNumber ?? draft.orderId;
  const fromGov = previewLine?.from.governorate;
  const toGov = previewLine?.to.governorate;
  const routeLabel =
    fromGov && toGov
      ? `${getGovernorateLabel(fromGov, locale)} → ${getGovernorateLabel(toGov, locale)}`
      : "—";

  const address = previewLine?.address;
  const needsDistrict = address?.method === "NONE";
  const suggestions = address?.suggestions ?? [];

  const rowError = draft.bulkError ?? previewLine?.error?.message ?? null;
  const hasProblems = (previewLine?.problems.length ?? 0) > 0;
  const connectionId = draft.connectionId ?? "";

  const weightText =
    previewLine != null
      ? previewLine.totalWeightKg.toLocaleString(intlLocale, {
          maximumFractionDigits: 3,
        })
      : "—";

  const heading = showIndex
    ? t("bulkBooking.orderHeadingIndexed", { index: index + 1, number: title })
    : title;

  return (
    <li className="list-none p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-foreground">{heading}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="-me-1 -mt-0.5 shrink-0 text-muted-foreground"
                aria-label={t("bulkBooking.removeRow", { order: title })}
                disabled={disabled}
                onClick={onRemove}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
            {order ? (
              <>
                <p className="mt-1 text-muted-foreground">
                  {order.receiverName}
                  <span aria-hidden="true"> · </span>
                  <span dir="ltr" className="tabular-nums">
                    {order.receiverPhone}
                  </span>
                </p>
                <p className="text-muted-foreground">{order.area}</p>
              </>
            ) : null}
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="text-start sm:col-span-3">
              <dt className="text-muted-foreground">{t("bulkBooking.colRoute")}</dt>
              <dd className="mt-0.5 font-medium text-foreground">{routeLabel}</dd>
              {previewLine?.pickup && previewLine.connection ? (
                <ShipmentPickupInfo
                  className="mt-2"
                  pickup={previewLine.pickup}
                  connectionId={previewLine.connection.id}
                  showDefaultWarning={showDefaultPickupWarning}
                />
              ) : null}
            </div>
            <div className="text-start">
              <dt className="text-muted-foreground">{t("bulkBooking.colBoxes")}</dt>
              <dd className="mt-0.5 flex items-center justify-start gap-1 font-medium tabular-nums text-foreground">
                {previewLine?.packagesCount ?? "—"}
                {canEditPackages && order ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    aria-label={t("bulkBooking.editPackages", { order: title })}
                    disabled={disabled}
                    onClick={onEditPackages}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </Button>
                ) : null}
              </dd>
            </div>
            <div className="text-start">
              <dt className="text-muted-foreground">{t("bulkBooking.colWeight")}</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                <span dir="ltr" className="inline-block tabular-nums">
                  {weightText}
                </span>{" "}
                <span className="text-muted-foreground">
                  {t("orders:table.weightUnit")}
                </span>
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <Label htmlFor={connectionSelectId} className="text-sm font-medium">
              {t("bulkBooking.colConnection")}
            </Label>
            <Select
              value={connectionId}
              onValueChange={onConnectionChange}
              disabled={disabled || !order}
            >
              <SelectTrigger id={connectionSelectId} className="w-full">
                <SelectValue placeholder={t("bulkBooking.connectionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {connections.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({carrierDisplayName(item.carrier, locale)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {address?.district && address.method !== "NONE" ? (
            <div>
              <p className="text-sm font-medium">{t("booking.matchedDistrict")}</p>
              <p className="text-sm text-muted-foreground">
                {getShipmentDistrictLabel(address.district, locale)}
              </p>
            </div>
          ) : null}

          {suggestions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("booking.suggestions")}</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((district) => (
                  <li key={district.id}>
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        selectedDistrict?.id === district.id ? "default" : "outline"
                      }
                      disabled={disabled || !connectionId}
                      onClick={() => onSuggestionPick(district)}
                    >
                      {getShipmentDistrictLabel(district, locale)}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {needsDistrict && connectionId ? (
            <ShipmentDistrictCombobox
              id={districtSelectId}
              connectionId={connectionId}
              governorateId={toGov?.id ?? ""}
              selectedDistrict={selectedDistrict}
              onSelect={onDistrictChange}
              disabled={disabled}
            />
          ) : null}

          {hasProblems ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
            >
              <p className="font-medium text-destructive">{t("booking.problemsTitle")}</p>
              <ul className="mt-2 list-disc space-y-1 ps-4 text-muted-foreground">
                {previewLine!.problems.map((problem) => (
                  <li key={problem.code}>
                    {problem.message}{" "}
                    <ShipmentProblemAction
                      code={problem.code}
                      connectionId={previewLine?.connection?.id}
                    />
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="link"
                className="mt-2 h-auto p-0"
                onClick={onEditOrder}
              >
                {t("booking.editOrder")}
              </Button>
            </div>
          ) : null}

          {rowError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {rowError}
            </div>
          ) : null}

          {draft.bulkOutcome === "BOOKING" ? (
            <p className="text-sm text-muted-foreground">{t("bulkBooking.confirmingRow")}</p>
          ) : null}

          {!order && previewLine?.error ? (
            <Button type="button" variant="outline" size="sm" onClick={onRemove}>
              {t("bulkBooking.dropRow")}
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
