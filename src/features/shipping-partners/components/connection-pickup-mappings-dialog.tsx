import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { ConnectionPickupMappingRow } from "@/features/shipping-partners/components/connection-pickup-mapping-row";
import { useConnectionPickupLocations } from "@/features/shipping-partners/hooks/use-connection-pickup-locations";
import { useUpdatePickupMappings } from "@/features/shipping-partners/hooks/use-update-pickup-mappings";
import {
  buildPickupMappingDrafts,
  draftsToPickupMappingsPayload,
  type PickupMappingRowDraft,
} from "@/features/shipping-partners/lib/pickup-mapping-draft";
import { parsePickupMappingSaveError } from "@/features/shipping-partners/lib/pickup-mapping-errors";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import { parseApiError } from "@/shared/api/error-handler";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

interface ConnectionPickupMappingsDialogProps {
  connection: CarrierConnection | null;
  open: boolean;
  canManage: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
}

export function ConnectionPickupMappingsDialog({
  connection,
  open,
  canManage,
  restoreFocusRef,
  onOpenChange,
}: ConnectionPickupMappingsDialogProps) {
  const { t } = useTranslation(["shippingPartners", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const formId = useId();
  const listId = `${formId}-list`;
  const connectionId = connection?.id ?? null;

  const pickupQuery = useConnectionPickupLocations(connectionId, { enabled: open });
  const senderQuery = useSenderLocations({ size: 100, sort: "NAME", direction: "ASC" }, {
    enabled: open,
  });
  const saveMutation = useUpdatePickupMappings(connectionId ?? "");

  const [drafts, setDrafts] = useState<PickupMappingRowDraft[]>([]);
  const [draftsReady, setDraftsReady] = useState(false);
  const [rowErrors, setRowErrors] = useState<{
    bySender: Record<string, string>;
    byPickup: Record<string, string>;
  }>({ bySender: {}, byPickup: {} });
  const [globalError, setGlobalError] = useState<string | null>(null);

  const senderLocations = senderQuery.data?.content ?? [];
  const pickupData = pickupQuery.data;

  useEffect(() => {
    if (!open) {
      setDraftsReady(false);
      return;
    }
    if (draftsReady || !pickupData || senderLocations.length === 0) return;
    setDrafts(buildPickupMappingDrafts(senderLocations, pickupData));
    setRowErrors({ bySender: {}, byPickup: {} });
    setGlobalError(null);
    setDraftsReady(true);
  }, [open, draftsReady, pickupData, senderLocations]);

  const defaultLabel = useMemo(() => {
    if (!pickupData) return t("pickupMappings.defaultOption");
    const defaultId = pickupData.defaultLocationId;
    const match = pickupData.locations.find((item) => item.id === defaultId);
    const name =
      connection?.pickupLocationName?.trim() ||
      match?.name ||
      defaultId ||
      t("form.useAccountDefault");
    return t("pickupMappings.defaultNamed", { name });
  }, [pickupData, connection?.pickupLocationName, t]);

  const handleDraftChange = useCallback(
    (senderLocationId: string, pickupLocationId: PickupMappingRowDraft["pickupLocationId"]) => {
      setDrafts((current) =>
        current.map((row) =>
          row.senderLocationId === senderLocationId
            ? { ...row, pickupLocationId }
            : row,
        ),
      );
      setRowErrors((current) => {
        const bySender = { ...current.bySender };
        delete bySender[senderLocationId];
        return { ...current, bySender };
      });
    },
    [],
  );

  const handleSave = async () => {
    if (!connectionId || !canManage) return;
    setGlobalError(null);
    setRowErrors({ bySender: {}, byPickup: {} });

    try {
      await saveMutation.mutateAsync(draftsToPickupMappingsPayload(drafts));
      toast.success(t("pickupMappings.saved"));
      onOpenChange(false);
    } catch (error) {
      const parsed = parsePickupMappingSaveError(error);
      if (parsed.global) {
        setGlobalError(parsed.global);
        return;
      }
      setRowErrors({
        bySender: parsed.bySenderLocationId,
        byPickup: parsed.byPickupLocationId,
      });
      if (
        Object.keys(parsed.bySenderLocationId).length === 0 &&
        Object.keys(parsed.byPickupLocationId).length === 0
      ) {
        setGlobalError(parseApiError(error).detail);
      }
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDrafts([]);
      setDraftsReady(false);
      setRowErrors({ bySender: {}, byPickup: {} });
      setGlobalError(null);
      const node = restoreFocusRef?.current;
      if (node?.isConnected) {
        window.requestAnimationFrame(() => node.focus());
      }
    }
    onOpenChange(next);
  };

  const loading =
    pickupQuery.isLoading || senderQuery.isLoading || (pickupQuery.isFetching && !pickupData);
  const loadFailed = pickupQuery.isError || senderQuery.isError;
  const carrierName = connection
    ? carrierDisplayName(connection.carrier, locale)
    : "";

  const rowErrorFor = (senderLocationId: string, pickupLocationId: string) =>
    rowErrors.bySender[senderLocationId] ??
    rowErrors.byPickup[pickupLocationId] ??
    null;

  const showMappingList =
    !loading &&
    !loadFailed &&
    pickupData &&
    senderLocations.length > 0 &&
    pickupData.locations.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="w3"
        className="gap-0 overflow-hidden"
        closeLabel={t("common:common.close")}
      >
        <DialogHeader className="gap-2 border-b border-border/60 pe-10">
          <DialogTitle>{t("pickupMappings.title")}</DialogTitle>
          {connection ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
              <CarrierMark
                code={connection.carrier.code}
                name={carrierName}
                logoUrl={connection.carrier.logoUrl}
              />
              <span className="font-medium">{connection.name}</span>
            </div>
          ) : null}
          <DialogDescription className="text-pretty">
            {t("pickupMappings.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="max-h-[min(55vh,22rem)] space-y-3 py-3">
          {loading ? (
            <p
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
              {t("pickupMappings.loading")}
            </p>
          ) : null}

          {loadFailed ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
            >
              <p className="font-medium text-destructive">
                {t("pickupMappings.loadFailed")}
              </p>
              <p className="mt-1 text-muted-foreground">
                {parseApiError(pickupQuery.error ?? senderQuery.error).detail}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  void pickupQuery.refetch();
                  void senderQuery.refetch();
                }}
              >
                {t("errors.retry")}
              </Button>
            </div>
          ) : null}

          {!loading && !loadFailed && pickupData?.locations.length === 0 ? (
            <p className="text-sm text-muted-foreground" role="status">
              {t("pickupMappings.noCarrierLocations")}
            </p>
          ) : null}

          {!loading && !loadFailed && senderLocations.length === 0 ? (
            <p className="text-sm text-muted-foreground" role="status">
              {t("pickupMappings.noSenderLocations")}
            </p>
          ) : null}

          {showMappingList ? (
            <>
              <div
                className="hidden items-center justify-between gap-3 px-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:flex"
                aria-hidden="true"
              >
                <span>{t("pickupMappings.colSender")}</span>
                <span className="w-[13.5rem] shrink-0 text-start">
                  {t("pickupMappings.colPickup")}
                </span>
              </div>
              <ul
                id={listId}
                className="space-y-2"
                aria-label={t("pickupMappings.tableCaption")}
              >
                {drafts.map((row) => {
                  const sender = senderLocations.find(
                    (item) => item.id === row.senderLocationId,
                  );
                  if (!sender) return null;
                  const selectId = `${formId}-${row.senderLocationId}`;
                  return (
                    <ConnectionPickupMappingRow
                      key={row.senderLocationId}
                      senderLocation={sender}
                      pickupLocationId={row.pickupLocationId}
                      locations={pickupData.locations}
                      defaultLabel={defaultLabel}
                      pickupData={pickupData}
                      selectId={selectId}
                      errorMessage={rowErrorFor(
                        row.senderLocationId,
                        row.pickupLocationId,
                      )}
                      disabled={!canManage || saveMutation.isPending}
                      onChange={(value) =>
                        handleDraftChange(row.senderLocationId, value)
                      }
                    />
                  );
                })}
              </ul>
            </>
          ) : null}

          {globalError ? (
            <p className="text-sm text-destructive" role="alert">
              {globalError}
            </p>
          ) : null}

          {!canManage ? (
            <p className="text-xs text-muted-foreground">
              {t("pickupMappings.readOnlyHint")}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter className="border-t border-border/60">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {canManage ? t("form.cancel") : t("pickupMappings.close")}
          </Button>
          {canManage ? (
            <Button
              type="button"
              disabled={
                loading ||
                loadFailed ||
                saveMutation.isPending ||
                !pickupData?.locations.length
              }
              onClick={() => void handleSave()}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("pickupMappings.saving")}
                </>
              ) : (
                t("pickupMappings.save")
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
