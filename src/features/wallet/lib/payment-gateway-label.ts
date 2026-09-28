import type { TFunction } from "i18next";
import type { PaymentGateway } from "@/features/wallet/types";

const GATEWAY_LABEL_KEYS: Record<string, string> = {
  KASHIER: "payments.gateways.KASHIER",
  PAYMOB: "payments.gateways.PAYMOB",
};

/** Known gateways get a display name. Anything else is shown as the raw value. */
export function getPaymentGatewayLabel(
  gateway: PaymentGateway,
  t: TFunction<"wallet">,
): string {
  const key = GATEWAY_LABEL_KEYS[gateway];
  return key ? t(key) : gateway;
}
