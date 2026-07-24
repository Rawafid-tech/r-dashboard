import { z } from "zod";

/** Shared Zod building blocks — pass localized messages from feature schemas. */

export function requiredString(message: string) {
  return z.string().trim().min(1, message);
}

export function emailField(messages: {
  required: string;
  invalid: string;
}) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .email(messages.invalid);
}

export function passwordField(messages: {
  required?: string;
  min: string;
  max: string;
}) {
  let schema = z.string();
  if (messages.required) {
    schema = schema.min(1, messages.required);
  }
  return schema.min(8, messages.min).max(100, messages.max);
}

export function phoneField(messages: {
  required?: string;
  invalid: string;
}) {
  let schema = z.string().trim();
  if (messages.required) {
    schema = schema.min(1, messages.required);
  }
  return schema.min(8, messages.invalid).max(20, messages.invalid);
}

export function countryCodeField(message: string) {
  return z
    .string()
    .trim()
    .length(2, message)
    .transform((value) => value.toUpperCase());
}

export function optionalTrimmedString(max = 255) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));
}

/** Past calendar date as `YYYY-MM-DD`, or empty/undefined. */
export function optionalPastDateField(message: string) {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      if (!value) return;

      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message });
        return;
      }

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const valid =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        date < today;

      if (!valid) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }
    });
}
