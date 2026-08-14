import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { GOOGLE_MAPS_API_KEY } from "@/shared/lib/constants";
import {
  DEFAULT_MAP_CENTER,
  isGoogleMapsConfigured,
  loadGoogleMaps,
  parseCoordinateInput,
  roundCoordinate,
} from "@/shared/lib/google-maps-loader";

interface CoordinateMapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude?: string;
  longitude?: string;
  onConfirm: (latitude: string, longitude: string) => void;
  onClear?: () => void;
}

export function CoordinateMapPickerDialog({
  open,
  onOpenChange,
  latitude,
  longitude,
  onConfirm,
  onClear,
}: CoordinateMapPickerDialogProps) {
  const { t } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");
  const mapContainerId = useId();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const apiKeyConfigured = isGoogleMapsConfigured(GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    if (!open) {
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    const initialLat = parseCoordinateInput(latitude);
    const initialLng = parseCoordinateInput(longitude);

    if (initialLat !== null && initialLng !== null) {
      setDraft({ lat: initialLat, lng: initialLng });
    } else {
      setDraft(null);
    }
  }, [open, latitude, longitude]);

  useEffect(() => {
    if (!open || !apiKeyConfigured || !mapRef.current) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    void loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        if (cancelled || !mapRef.current) return;

        const initialLat = parseCoordinateInput(latitude);
        const initialLng = parseCoordinateInput(longitude);
        const hasInitial = initialLat !== null && initialLng !== null;
        const center = hasInitial
          ? { lat: initialLat, lng: initialLng }
          : DEFAULT_MAP_CENTER;

        const map = new maps.Map(mapRef.current, {
          center,
          zoom: hasInitial ? 15 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        if (hasInitial) {
          markerRef.current = new maps.Marker({
            map,
            position: center,
          });
        }

        clickListenerRef.current = map.addListener(
          "click",
          (event: google.maps.MapMouseEvent) => {
          const lat = event.latLng?.lat();
          const lng = event.latLng?.lng();
          if (lat == null || lng == null) return;

          const next = {
            lat: roundCoordinate(lat),
            lng: roundCoordinate(lng),
          };

          setDraft(next);

          if (markerRef.current) {
            markerRef.current.setPosition(next);
          } else {
            markerRef.current = new maps.Marker({
              map,
              position: next,
            });
          }
        });

        window.setTimeout(() => {
          if (!cancelled) {
            maps.event.trigger(map, "resize");
            map.setCenter(center);
          }
        }, 150);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(t("mapPicker.loadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      clickListenerRef.current?.remove();
      clickListenerRef.current = null;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapInstanceRef.current = null;
    };
  }, [open, apiKeyConfigured, latitude, longitude, t]);

  const handleConfirm = () => {
    if (!draft) return;

    onConfirm(String(draft.lat), String(draft.lng));
    onOpenChange(false);
  };

  const handleClear = () => {
    onClear?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="w6"
        className="gap-0"
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("mapPicker.title")}</DialogTitle>
          <DialogDescription>{t("mapPicker.description")}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {!apiKeyConfigured ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {t("mapPicker.missingApiKey")}
            </div>
          ) : null}

          {loadError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {loadError}
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-lg border border-border/70">
            <div
              ref={mapRef}
              id={mapContainerId}
              role="application"
              aria-label={t("mapPicker.mapLabel")}
              className="h-[min(52vh,22rem)] w-full bg-muted"
            />
            {isLoading ? (
              <div
                className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm text-muted-foreground"
                role="status"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("mapPicker.loading")}
              </div>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">{t("mapPicker.help")}</p>

          {draft ? (
            <p className="text-sm tabular-nums text-foreground" dir="ltr">
              {t("mapPicker.selected", {
                lat: draft.lat,
                lng: draft.lng,
              })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground" role="status">
              {t("mapPicker.noneSelected")}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          {onClear ? (
            <Button
              type="button"
              variant="ghost"
              className="me-auto"
              onClick={handleClear}
            >
              {t("mapPicker.clear")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tCommon("common.cancel")}
          </Button>
          <Button type="button" disabled={!draft} onClick={handleConfirm}>
            <MapPin aria-hidden="true" />
            {t("mapPicker.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
