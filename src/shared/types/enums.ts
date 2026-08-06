export const MonthlyShipmentVolume = {
  VOL_0_50: "VOL_0_50",
  VOL_50_200: "VOL_50_200",
  VOL_200_500: "VOL_200_500",
  VOL_500_1000: "VOL_500_1000",
  VOL_1000_PLUS: "VOL_1000_PLUS",
} as const;
export type MonthlyShipmentVolume =
  (typeof MonthlyShipmentVolume)[keyof typeof MonthlyShipmentVolume];

export const CompanySize = {
  FROM_1_TO_10: "FROM_1_TO_10",
  FROM_11_TO_50: "FROM_11_TO_50",
  FROM_51_TO_200: "FROM_51_TO_200",
  ABOVE_200: "ABOVE_200",
} as const;
export type CompanySize = (typeof CompanySize)[keyof typeof CompanySize];

export const BillingPeriod = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const;
export type BillingPeriod = (typeof BillingPeriod)[keyof typeof BillingPeriod];

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  REPLACED: "REPLACED",
  EXPIRED: "EXPIRED",
} as const;
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const PlanStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export const PlanFeatureType = {
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  UNLIMITED: "UNLIMITED",
  TEXT: "TEXT",
} as const;
export type PlanFeatureType =
  (typeof PlanFeatureType)[keyof typeof PlanFeatureType];

export const UserStatus = {
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const MerchantRole = {
  OWNER: "OWNER",
  AGENT: "AGENT",
} as const;
export type MerchantRole = (typeof MerchantRole)[keyof typeof MerchantRole];

export const AdminRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SUPPORT: "SUPPORT",
} as const;
export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];

export const Theme = {
  SYSTEM: "SYSTEM",
  LIGHT: "LIGHT",
  DARK: "DARK",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export const DateFormat = {
  DD_MM_YYYY: "DD_MM_YYYY",
  MM_DD_YYYY: "MM_DD_YYYY",
  YYYY_MM_DD: "YYYY_MM_DD",
} as const;
export type DateFormat = (typeof DateFormat)[keyof typeof DateFormat];

export const FontScale = [80, 90, 100, 110, 120] as const;
export type FontScale = (typeof FontScale)[number];
