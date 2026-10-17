import { ShipmentsHome } from "@/features/shipments/components/shipments-home";

/** Exchanges-only list (`kind=EXCHANGE`) using the shipments API. */
export function ExchangesHome() {
  return <ShipmentsHome scope="exchanges" />;
}
