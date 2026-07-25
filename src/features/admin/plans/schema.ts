import { z } from "zod";
import type { TFunction } from "i18next";
import { PlanFeatureType } from "@/shared/types/enums";
import { requiredString } from "@/shared/lib/validators";

const featureTypeValues = Object.values(PlanFeatureType) as [
  (typeof PlanFeatureType)[keyof typeof PlanFeatureType],
  ...(typeof PlanFeatureType)[keyof typeof PlanFeatureType][],
];

const priceSchema = (message: string) =>
  z
    .number({ invalid_type_error: message })
    .min(0, message)
    .refine(
      (value) => Number.isInteger(value * 100),
      message,
    );

function createTierSchema(t: TFunction<"admin">) {
  return z.object({
    shipmentsPerMonth: z
      .number({ invalid_type_error: t("plans.form.validation.tierShipments") })
      .int(t("plans.form.validation.tierShipments"))
      .positive(t("plans.form.validation.tierShipments")),
    monthlyPrice: priceSchema(t("plans.form.validation.tierPrice")),
    yearlyPrice: priceSchema(t("plans.form.validation.tierPrice")),
    sortOrder: z
      .number({ invalid_type_error: t("plans.form.validation.sortOrder") })
      .int(t("plans.form.validation.sortOrder"))
      .min(0, t("plans.form.validation.sortOrder")),
  });
}

function createFeatureSchema(t: TFunction<"admin">) {
  return z
    .object({
      labelEn: requiredString(t("plans.form.validation.labelEn")),
      labelAr: requiredString(t("plans.form.validation.labelAr")),
      type: z.enum(featureTypeValues, {
        errorMap: () => ({ message: t("plans.form.validation.featureType") }),
      }),
      number: z.number().nullable().optional(),
      enabled: z.boolean().nullable().optional(),
      text: z.string().nullable().optional(),
    })
    .superRefine((feature, ctx) => {
      if (feature.type === PlanFeatureType.NUMBER) {
        if (feature.number == null || feature.number < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("plans.form.validation.featureNumber"),
            path: ["number"],
          });
        }
      }

      if (feature.type === PlanFeatureType.BOOLEAN) {
        if (feature.enabled == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("plans.form.validation.featureEnabled"),
            path: ["enabled"],
          });
        }
      }

      if (feature.type === PlanFeatureType.TEXT) {
        if (!feature.text?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("plans.form.validation.featureText"),
            path: ["text"],
          });
        }
      }
    });
}

function createPlanBodySchema(t: TFunction<"admin">) {
  const tierSchema = createTierSchema(t);
  const featureSchema = createFeatureSchema(t);

  const baseObject = z.object({
    code: z
      .string()
      .trim()
      .min(1, t("plans.form.validation.code"))
      .max(50, t("plans.form.validation.codeFormat"))
      .regex(/^[A-Z0-9_]+$/, t("plans.form.validation.codeFormat"))
      .transform((value) => value.toUpperCase()),
    nameEn: requiredString(t("plans.form.validation.nameEn")),
    nameAr: requiredString(t("plans.form.validation.nameAr")),
    descriptionEn: requiredString(t("plans.form.validation.descriptionEn")),
    descriptionAr: requiredString(t("plans.form.validation.descriptionAr")),
    highlighted: z.boolean(),
    customPricing: z.boolean(),
    sortOrder: z
      .number({ invalid_type_error: t("plans.form.validation.sortOrder") })
      .int(t("plans.form.validation.sortOrder"))
      .min(0, t("plans.form.validation.sortOrder")),
    tiers: z.array(tierSchema),
    features: z.array(featureSchema),
  });

  return applyPlanRules(baseObject, t);
}

function applyPlanRules<T extends z.ZodTypeAny>(schema: T, t: TFunction<"admin">) {
  return schema.superRefine((values, ctx) => {
    if (values.customPricing) {
      if (values.tiers.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("plans.form.validation.customPricingTiers"),
          path: ["tiers"],
        });
      }
      return;
    }

    if (values.tiers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("plans.form.validation.tiersRequired"),
        path: ["tiers"],
      });
      return;
    }

    const shipmentCounts = values.tiers.map(
      (tier: { shipmentsPerMonth: number }) => tier.shipmentsPerMonth,
    );
    const uniqueCounts = new Set(shipmentCounts);
    if (uniqueCounts.size !== shipmentCounts.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("plans.form.validation.duplicateTierVolume"),
        path: ["tiers"],
      });
    }
  });
}

export function createPlanSchema(t: TFunction<"admin">) {
  return createPlanBodySchema(t);
}

export function createUpdatePlanSchema(t: TFunction<"admin">) {
  const tierSchema = createTierSchema(t);
  const featureSchema = createFeatureSchema(t);

  const baseObject = z.object({
    code: z.string().optional(),
    nameEn: requiredString(t("plans.form.validation.nameEn")),
    nameAr: requiredString(t("plans.form.validation.nameAr")),
    descriptionEn: requiredString(t("plans.form.validation.descriptionEn")),
    descriptionAr: requiredString(t("plans.form.validation.descriptionAr")),
    highlighted: z.boolean(),
    customPricing: z.boolean(),
    sortOrder: z
      .number({ invalid_type_error: t("plans.form.validation.sortOrder") })
      .int(t("plans.form.validation.sortOrder"))
      .min(0, t("plans.form.validation.sortOrder")),
    tiers: z.array(tierSchema),
    features: z.array(featureSchema),
  });

  return applyPlanRules(baseObject, t);
}

export type PlanFormValues = z.infer<ReturnType<typeof createPlanSchema>>;
export type UpdatePlanFormValues = z.infer<
  ReturnType<typeof createUpdatePlanSchema>
>;

export type PlanStatusFilter = "ALL" | "ACTIVE" | "ARCHIVED";

export function readStatusFilter(value: string | null): PlanStatusFilter {
  if (value === "ACTIVE" || value === "ARCHIVED") return value;
  return "ALL";
}
