import { z } from "zod";

export const emailSchema = z.string().email();

export const passwordSchema = z.string().min(8).max(100);

export const phoneSchema = z.string().min(8).max(20);

export const requiredString = z.string().min(1);

export const countryCodeSchema = z
  .string()
  .length(2)
  .transform((v) => v.toUpperCase());
