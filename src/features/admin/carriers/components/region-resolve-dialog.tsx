import { useId, useState, type FormEvent, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import {
  localizedName,
  secondaryName,
} from "@/features/admin/carriers/lib/region-label";
import type {
  RegionResolveMethod,
  RegionResolveResult,
} from "@/features/admin/carriers/types";
import { useResolveCarrierRegion } from "@/features/admin/carriers/hooks/use-resolve-carrier-region";
import { useGovernorates } from "@/features/locations/hooks/use-governorates";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import { parseApiError } from "@/shared/api/error-handler";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";

const METHODS: RegionResolveMethod[] = ["DISTRICT", "ZONE", "HEAD", "NONE"];

function isResolveMethod(value: string): value is RegionResolveMethod {
  return METHODS.includes(value as RegionResolveMethod);
}

interface RegionResolveDialogProps {
  carrierCode: string;
  trigger: ReactElement;
}

export function RegionResolveDialog({
  carrierCode,
  trigger,
}: RegionResolveDialogProps) {
  const { t } = useTranslation(["admin", "common"]);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        size="w4"
        className="gap-0 overflow-hidden"
        closeLabel={t("common:common.close")}
      >
        {open ? (
          <RegionResolveDialogContent
            carrierCode={carrierCode}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RegionResolveDialogContent({
  carrierCode,
  onClose,
}: {
  carrierCode: string;
  onClose: () => void;
}) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const formId = useId();
  const governoratesQuery = useGovernorates("EG");
  const resolveMutation = useResolveCarrierRegion(carrierCode);
  const [governorateId, setGovernorateId] = useState("");
  const [district, setDistrict] = useState("");
  const [governorateError, setGovernorateError] = useState<string | null>(null);
  const [districtError, setDistrictError] = useState<string | null>(null);

  const governorateFieldId = `${formId}-governorate`;
  const districtFieldId = `${formId}-district`;
  const governorateErrorId = `${formId}-governorate-error`;
  const districtErrorId = `${formId}-district-error`;
  const result = resolveMutation.data;
  const errorDetail = resolveMutation.isError
    ? parseApiError(resolveMutation.error).detail ||
      t("carriers.regions.resolve.failed")
    : null;

  function clearResult() {
    if (resolveMutation.isIdle) return;
    resolveMutation.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedDistrict = district.trim();
    const nextGovernorateError = governorateId
      ? null
      : t("carriers.regions.resolve.governorateRequired");
    const nextDistrictError = trimmedDistrict
      ? null
      : t("carriers.regions.resolve.districtRequired");

    setGovernorateError(nextGovernorateError);
    setDistrictError(nextDistrictError);

    if (nextGovernorateError || nextDistrictError) {
      resolveMutation.reset();
      if (nextGovernorateError) {
        document.getElementById(governorateFieldId)?.focus();
      } else {
        document.getElementById(districtFieldId)?.focus();
      }
      return;
    }

    resolveMutation.mutate({
      governorateId,
      district: trimmedDistrict,
    });
  }

  return (
    <>
      <DialogHeader className="border-b border-border/60 pe-10">
        <DialogTitle>{t("carriers.regions.resolve.title")}</DialogTitle>
        <DialogDescription>
          {t("carriers.regions.resolve.description")}
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
          aria-busy={resolveMutation.isPending}
          noValidate
        >
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor={governorateFieldId}>
              {t("carriers.regions.resolve.governorateLabel")}
            </Label>
            <Select
              value={governorateId || undefined}
              onValueChange={(value) => {
                setGovernorateId(value);
                setGovernorateError(null);
                clearResult();
              }}
              disabled={resolveMutation.isPending || governoratesQuery.isLoading}
            >
              <SelectTrigger
                id={governorateFieldId}
                className="w-full bg-background"
                aria-invalid={governorateError ? true : undefined}
                aria-describedby={
                  governorateError ? governorateErrorId : undefined
                }
              >
                <SelectValue
                  placeholder={t(
                    "carriers.regions.resolve.governoratePlaceholder",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {(governoratesQuery.data ?? []).map((governorate) => (
                  <SelectItem key={governorate.id} value={governorate.id}>
                    {getGovernorateLabel(governorate, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {governorateError ? (
              <p id={governorateErrorId} className="text-sm text-destructive">
                {governorateError}
              </p>
            ) : null}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor={districtFieldId}>
              {t("carriers.regions.resolve.districtLabel")}
            </Label>
            <Input
              id={districtFieldId}
              value={district}
              onChange={(event) => {
                setDistrict(event.target.value);
                setDistrictError(null);
                clearResult();
              }}
              placeholder={t("carriers.regions.resolve.districtPlaceholder")}
              autoComplete="off"
              spellCheck={false}
              maxLength={200}
              disabled={resolveMutation.isPending}
              aria-invalid={districtError ? true : undefined}
              aria-describedby={districtError ? districtErrorId : undefined}
            />
            {districtError ? (
              <p id={districtErrorId} className="text-sm text-destructive">
                {districtError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" disabled={resolveMutation.isPending}>
              <Search aria-hidden="true" />
              {resolveMutation.isPending
                ? t("carriers.regions.resolve.pending")
                : t("carriers.regions.resolve.submit")}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("carriers.regions.resolve.close")}
            </Button>
          </div>
        </form>

        {governoratesQuery.isError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {t("carriers.regions.errors.governorates")}
          </p>
        ) : null}

        <div className="mt-4" aria-live="polite">
          {errorDetail ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {errorDetail}
            </p>
          ) : null}

          {result && !resolveMutation.isPending ? (
            <ResolveResult result={result} />
          ) : null}
        </div>
      </DialogBody>
    </>
  );
}

function ResolveResult({ result }: { result: RegionResolveResult }) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const method = isResolveMethod(result.method) ? result.method : "NONE";
  const district = result.district;
  const districtName = localizedName(
    district?.districtNameEn,
    district?.districtNameAr,
    locale,
  );
  const zoneName = localizedName(
    district?.zone?.nameEn,
    district?.zone?.nameAr,
    locale,
  );
  const cityName = localizedName(
    district?.city?.nameEn,
    district?.city?.nameAr,
    locale,
  );
  const fallbackName = localizedName(
    result.fallbackCity?.nameEn,
    result.fallbackCity?.nameAr,
    locale,
  );
  const fallbackSecondary = secondaryName(
    result.fallbackCity?.nameEn,
    result.fallbackCity?.nameAr,
    locale,
  );
  const path = [cityName, zoneName, districtName].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {t("carriers.regions.resolve.resultLabel")}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant={method === "NONE" ? "warning" : "success"}>
          {t(`carriers.regions.resolve.methods.${method}`)}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {t("carriers.regions.resolve.typed")}{" "}
          <span dir="auto" className="font-medium text-foreground">
            {result.text}
          </span>
        </p>
      </div>
      <p className="mt-2 text-sm text-foreground">
        {t(`carriers.regions.resolve.methodHelp.${method}`)}
      </p>
      {method !== "NONE" && path ? (
        <p className="mt-2 text-sm">
          <span className="text-muted-foreground">
            {t("carriers.regions.resolve.matched")}{" "}
          </span>
          <span dir="auto" className="font-medium">
            {path}
          </span>
        </p>
      ) : null}
      {method === "NONE" && fallbackName ? (
        <p className="mt-2 text-sm">
          {t("carriers.regions.resolve.fallback")}{" "}
          <span dir="auto" className="font-medium">
            {fallbackName}
          </span>
          {fallbackSecondary ? (
            <span dir="auto" className="text-muted-foreground">
              {" "}
              ({fallbackSecondary})
            </span>
          ) : null}
        </p>
      ) : null}
      {method === "NONE" && !result.fallbackCity ? (
        <p className="mt-2 text-sm text-foreground">
          {t("carriers.regions.resolve.noCity")}
        </p>
      ) : null}
      {district?.dropOffAvailable === false ? (
        <Badge variant="warning" className="mt-2">
          {t("carriers.regions.table.noDropOff")}
        </Badge>
      ) : null}
    </div>
  );
}
