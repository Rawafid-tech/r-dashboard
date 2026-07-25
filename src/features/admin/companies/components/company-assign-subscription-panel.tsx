import { useEffect, useId, useMemo, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui";
import { useAssignCompanySubscription } from "@/features/admin/companies/hooks/use-assign-company-subscription";
import type { AdminCompany } from "@/features/admin/companies/types";
import { getPlanDisplayName } from "@/features/admin/plans/lib/plan-label";
import { useAdminPlans } from "@/features/admin/plans/hooks/use-admin-plans";
import type { AdminPlan } from "@/features/admin/plans/types";
import type { Subscription } from "@/features/subscription/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { BillingPeriod, PlanStatus } from "@/shared/types/enums";
import { useLocaleStore } from "@/stores/locale.store";

interface CompanyAssignSubscriptionPanelProps {
  company: AdminCompany;
  activeSubscription?: Subscription;
  canAssign: boolean;
}

function getAssignablePlans(plans: AdminPlan[] | undefined): AdminPlan[] {
  return (plans ?? [])
    .filter(
      (plan) => plan.status === PlanStatus.ACTIVE && !plan.customPricing,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function CompanyAssignSubscriptionPanel({
  company,
  activeSubscription,
  canAssign,
}: CompanyAssignSubscriptionPanelProps) {
  const { t } = useTranslation(["admin", "billing"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const formId = useId();

  const plansQuery = useAdminPlans();
  const assignMutation = useAssignCompanySubscription(company.id);
  const [sheetOpen, setSheetOpen] = useState(false);

  const assignablePlans = useMemo(
    () => getAssignablePlans(plansQuery.data),
    [plansQuery.data],
  );

  const [planId, setPlanId] = useState("");
  const [shipmentsPerMonth, setShipmentsPerMonth] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(
    BillingPeriod.MONTHLY,
  );

  useEffect(() => {
    if (planId || assignablePlans.length === 0) return;

    const matchedPlan =
      assignablePlans.find((plan) => plan.id === activeSubscription?.planId) ??
      assignablePlans.find((plan) => plan.code === company.planCode) ??
      assignablePlans[0];

    if (!matchedPlan) return;

    const matchedTier =
      matchedPlan.tiers.find(
        (tier) =>
          tier.shipmentsPerMonth === activeSubscription?.shipmentsPerMonth,
      ) ?? matchedPlan.tiers[0];

    setPlanId(matchedPlan.id);
    setShipmentsPerMonth(
      matchedTier ? String(matchedTier.shipmentsPerMonth) : "",
    );
    setBillingPeriod(
      activeSubscription?.billingPeriod ?? BillingPeriod.MONTHLY,
    );
  }, [
    activeSubscription,
    assignablePlans,
    company.planCode,
    planId,
  ]);

  const selectedPlan = assignablePlans.find((plan) => plan.id === planId);
  const selectedTier = selectedPlan?.tiers.find(
    (tier) => String(tier.shipmentsPerMonth) === shipmentsPerMonth,
  );
  const isFreePlan = selectedPlan?.code === "FREE";
  const previewPrice =
    selectedTier && billingPeriod === BillingPeriod.MONTHLY
      ? selectedTier.monthlyPrice
      : selectedTier?.yearlyPrice;

  const isFormReady = Boolean(planId && shipmentsPerMonth && billingPeriod);
  const isPending = assignMutation.isPending;

  const handlePlanChange = (nextPlanId: string) => {
    setPlanId(nextPlanId);
    const plan = assignablePlans.find((item) => item.id === nextPlanId);
    const firstTier = plan?.tiers[0];
    setShipmentsPerMonth(
      firstTier ? String(firstTier.shipmentsPerMonth) : "",
    );
  };

  const handleConfirm = async () => {
    if (!isFormReady) return;

    try {
      await assignMutation.mutateAsync({
        planId,
        shipmentsPerMonth: Number(shipmentsPerMonth),
        billingPeriod,
      });
      setSheetOpen(false);
    } catch {
      // Toast handled in mutation hook
    }
  };

  if (!canAssign) {
    return null;
  }

  return (
    <>
      <Card className="border-border/80">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/12 dark:text-emerald-200"
              aria-hidden="true"
            >
              <CreditCard className="size-4" />
            </span>
            <div>
              <CardTitle>{t("admin:companies.detail.assign.title")}</CardTitle>
              <CardDescription>
                {t("admin:companies.detail.assign.subtitle")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {plansQuery.isLoading ? (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("admin:companies.detail.assign.loadingPlans")}
            </div>
          ) : null}

          {plansQuery.isError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"
            >
              <p className="text-sm font-medium text-destructive">
                {t("admin:companies.detail.assign.plansError")}
              </p>
              <button
                type="button"
                className="mt-2 text-sm font-medium text-primary hover:underline"
                onClick={() => void plansQuery.refetch()}
              >
                {t("admin:companies.errors.retry")}
              </button>
            </div>
          ) : null}

          {!plansQuery.isLoading &&
          !plansQuery.isError &&
          assignablePlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("admin:companies.detail.assign.noPlans")}
            </p>
          ) : null}

          {!plansQuery.isLoading &&
          !plansQuery.isError &&
          assignablePlans.length > 0 ? (
            <form
              id={formId}
              className="grid gap-5 lg:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (isFormReady) setSheetOpen(true);
              }}
            >
              <Field>
                <FieldLabel htmlFor={`${formId}-plan`}>
                  {t("admin:companies.detail.assign.plan")}
                </FieldLabel>
                <Select value={planId} onValueChange={handlePlanChange}>
                  <SelectTrigger
                    id={`${formId}-plan`}
                    className="w-full"
                    disabled={isPending}
                  >
                    <SelectValue
                      placeholder={t(
                        "admin:companies.detail.assign.planPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {assignablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <span className="flex items-center gap-2">
                          <span>{getPlanDisplayName(plan.name, locale)}</span>
                          <span className="font-mono text-xs uppercase text-muted-foreground">
                            {plan.code}
                          </span>
                          {plan.code === company.planCode ? (
                            <Badge variant="outline" className="text-[10px]">
                              {t("admin:companies.detail.assign.currentBadge")}
                            </Badge>
                          ) : null}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`${formId}-tier`}>
                  {t("admin:companies.detail.assign.tier")}
                </FieldLabel>
                <Select
                  value={shipmentsPerMonth}
                  onValueChange={setShipmentsPerMonth}
                  disabled={!selectedPlan || selectedPlan.tiers.length === 0}
                >
                  <SelectTrigger
                    id={`${formId}-tier`}
                    className="w-full"
                    disabled={isPending || !selectedPlan}
                  >
                    <SelectValue
                      placeholder={t(
                        "admin:companies.detail.assign.tierPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPlan?.tiers.map((tier) => (
                      <SelectItem
                        key={tier.shipmentsPerMonth}
                        value={String(tier.shipmentsPerMonth)}
                      >
                        {t("admin:companies.detail.assign.tierOption", {
                          count: tier.shipmentsPerMonth.toLocaleString(
                            intlLocale,
                          ),
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`${formId}-billing-period`}>
                  {t("admin:companies.detail.assign.billingPeriod")}
                </FieldLabel>
                <Select
                  value={billingPeriod}
                  onValueChange={(value) =>
                    setBillingPeriod(value as BillingPeriod)
                  }
                  disabled={isFreePlan}
                >
                  <SelectTrigger
                    id={`${formId}-billing-period`}
                    className="w-full"
                    disabled={isPending || isFreePlan}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BillingPeriod.MONTHLY}>
                      {t("billing:billingPeriod.MONTHLY")}
                    </SelectItem>
                    <SelectItem value={BillingPeriod.YEARLY}>
                      {t("billing:billingPeriod.YEARLY")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isFreePlan ? (
                  <FieldDescription>
                    {t("admin:companies.detail.assign.freeHint")}
                  </FieldDescription>
                ) : null}
              </Field>

              <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("admin:companies.detail.assign.preview")}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {selectedPlan
                    ? getPlanDisplayName(selectedPlan.name, locale)
                    : "—"}
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">
                      {t("admin:companies.detail.subscriptions.shipments")}
                    </dt>
                    <dd dir="ltr" className="font-medium tabular-nums">
                      {selectedTier
                        ? selectedTier.shipmentsPerMonth.toLocaleString(
                            intlLocale,
                          )
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">
                      {t("admin:companies.detail.assign.previewPrice")}
                    </dt>
                    <dd
                      dir={isFreePlan ? undefined : "ltr"}
                      className="font-medium tabular-nums"
                    >
                      {isFreePlan
                        ? t("admin:companies.detail.assign.previewFree")
                        : selectedTier
                          ? formatCurrency(
                              previewPrice ?? 0,
                              "EGP",
                              intlLocale,
                            )
                          : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
                <Button
                  type="submit"
                  disabled={!isFormReady || isPending}
                >
                  {t("admin:companies.detail.assign.submit")}
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {t("admin:companies.detail.assign.confirmTitle")}
            </SheetTitle>
            <SheetDescription>
              {t("admin:companies.detail.assign.confirmDescription", {
                company: company.name,
              })}
            </SheetDescription>
          </SheetHeader>

          {selectedPlan && selectedTier ? (
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/10 p-4 text-sm">
              <p className="font-medium text-foreground">
                {getPlanDisplayName(selectedPlan.name, locale)}
              </p>
              <p className="mt-1 text-muted-foreground">
                {t("admin:companies.detail.assign.tierOption", {
                  count: selectedTier.shipmentsPerMonth.toLocaleString(
                    intlLocale,
                  ),
                })}
                {" · "}
                {isFreePlan
                  ? t("admin:companies.detail.assign.previewFree")
                  : `${t(`billing:billingPeriod.${billingPeriod}`)} · ${formatCurrency(
                      previewPrice ?? 0,
                      "EGP",
                      intlLocale,
                    )}`}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-row justify-end gap-2 p-4 pt-0">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {t("admin:companies.detail.assign.cancel")}
              </Button>
            </SheetClose>
            <Button
              type="button"
              disabled={!isFormReady || isPending}
              onClick={() => void handleConfirm()}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("admin:companies.detail.assign.confirming")}
                </>
              ) : (
                t("admin:companies.detail.assign.confirm")
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
