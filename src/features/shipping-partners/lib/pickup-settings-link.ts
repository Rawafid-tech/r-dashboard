export function connectionPickupSettingsPath(connectionId: string): string {
  const params = new URLSearchParams({
    tab: "connected",
    pickupConnection: connectionId,
  });
  return `/shipping-partners?${params.toString()}`;
}
