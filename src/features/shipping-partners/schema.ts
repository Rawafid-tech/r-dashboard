import type { TFunction } from "i18next";
import { z } from "zod";
import type { CarrierField } from "@/features/shipping-partners/types";

export interface ConnectionValidationContext {
  step: 1 | 2;
  mode: "create" | "edit";
  fields: CarrierField[];
  pickupIds: string[];
  savedPickupId: string;
}

const NAME_MAX = 200;
const TEXT_MAX = 500;

export function createConnectionFormSchema(
  t: TFunction<"shippingPartners">,
  getContext: () => ConnectionValidationContext,
) {
  return z
    .object({
      name: z.string(),
      active: z.boolean(),
      credentials: z.record(z.string(), z.string()),
      options: z.record(z.string(), z.union([z.string(), z.boolean()])),
    })
    .superRefine((values, ctx) => {
      const { step, mode, fields, pickupIds, savedPickupId } = getContext();

      for (const field of fields) {
        if (field.kind !== "SECRET") continue;
        const value = (values.credentials[field.key] ?? "").trim();
        if (mode === "create" && field.required && !value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["credentials", field.key],
            message: t("form.required"),
          });
        }
      }

      if (step === 1) return;

      const name = values.name.trim();
      if (!name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: t("form.nameRequired"),
        });
      } else if (name.length > NAME_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: t("form.nameTooLong", { max: NAME_MAX }),
        });
      }

      for (const field of fields) {
        if (field.kind === "SECRET") continue;
        const raw = values.options[field.key];

        if (field.kind === "TEXT") {
          const text = typeof raw === "string" ? raw : "";
          if (field.required && !text.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["options", field.key],
              message: t("form.required"),
            });
          } else if (text.length > TEXT_MAX) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["options", field.key],
              message: t("form.textTooLong", { max: TEXT_MAX }),
            });
          }
        }

        if (field.kind === "SELECT") {
          const value = typeof raw === "string" ? raw : "";
          const allowed = new Set(field.options.map((option) => option.value));
          if (field.required && !value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["options", field.key],
              message: t("form.required"),
            });
          } else if (value && !allowed.has(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["options", field.key],
              message: t("form.invalidOption"),
            });
          }
        }

        if (field.kind === "PICKUP_LOCATION") {
          const value = typeof raw === "string" ? raw : "";
          if (!value) continue;

          const allowed =
            pickupIds.length > 0
              ? pickupIds.includes(value)
              : mode === "edit" && value === savedPickupId;

          if (!allowed) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["options", field.key],
              message: t("form.invalidPickup"),
            });
          }
        }
      }
    });
}
