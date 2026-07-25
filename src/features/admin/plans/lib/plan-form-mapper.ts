import type { AdminPlan, CreatePlanRequest, UpdatePlanRequest } from "@/features/admin/plans/types";
import type { PlanFormValues } from "@/features/admin/plans/schema";

export function toPlanFormValues(plan: AdminPlan): PlanFormValues {
  return {
    code: plan.code,
    nameEn: plan.name?.en ?? "",
    nameAr: plan.name?.ar ?? "",
    descriptionEn: plan.description?.en ?? "",
    descriptionAr: plan.description?.ar ?? "",
    highlighted: plan.highlighted,
    customPricing: plan.customPricing,
    sortOrder: plan.sortOrder,
    tiers: plan.customPricing
      ? []
      : plan.tiers
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((tier) => ({
            shipmentsPerMonth: tier.shipmentsPerMonth,
            monthlyPrice: tier.monthlyPrice,
            yearlyPrice: tier.yearlyPrice,
            sortOrder: tier.sortOrder,
          })),
    features: plan.features.map((feature) => ({
      labelEn: feature.label?.en ?? "",
      labelAr: feature.label?.ar ?? "",
      type: feature.type,
      number: feature.number ?? null,
      enabled: feature.enabled ?? null,
      text: feature.text ?? null,
    })),
  };
}

export function toCreatePlanPayload(values: PlanFormValues): CreatePlanRequest {
  return {
    code: values.code.trim().toUpperCase(),
    name: { en: values.nameEn.trim(), ar: values.nameAr.trim() },
    description: {
      en: values.descriptionEn.trim(),
      ar: values.descriptionAr.trim(),
    },
    highlighted: values.highlighted,
    customPricing: values.customPricing,
    sortOrder: values.sortOrder,
    tiers: values.customPricing
      ? []
      : values.tiers.map(
          (
            tier: PlanFormValues["tiers"][number],
            index: number,
          ) => ({
          shipmentsPerMonth: tier.shipmentsPerMonth,
          monthlyPrice: tier.monthlyPrice,
          yearlyPrice: tier.yearlyPrice,
          sortOrder: tier.sortOrder ?? index,
        }),
        ),
    features: values.features.map((feature: PlanFormValues["features"][number]) => ({
      label: { en: feature.labelEn.trim(), ar: feature.labelAr.trim() },
      type: feature.type,
      number: feature.type === "NUMBER" ? feature.number : null,
      enabled: feature.type === "BOOLEAN" ? feature.enabled : null,
      text: feature.type === "TEXT" ? feature.text?.trim() || null : null,
    })),
  };
}

export function toUpdatePlanPayload(values: PlanFormValues): UpdatePlanRequest {
  const { code: _code, ...rest } = toCreatePlanPayload(values);
  return rest;
}

export const EMPTY_PLAN_FORM_VALUES: PlanFormValues = {
  code: "",
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  highlighted: false,
  customPricing: false,
  sortOrder: 0,
  tiers: [
    {
      shipmentsPerMonth: 50,
      monthlyPrice: 0,
      yearlyPrice: 0,
      sortOrder: 0,
    },
  ],
  features: [],
};
