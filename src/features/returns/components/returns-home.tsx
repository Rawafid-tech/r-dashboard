import { ShipmentsHome } from "@/features/shipments/components/shipments-home";

/** Returns-only list (`kind=RETURN_PICKUP`) using the shipments API. */
export function ReturnsHome() {
  return <ShipmentsHome scope="returns" />;
}
