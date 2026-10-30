import { useCallback } from "react";
import { useCarrierPlatforms } from "@/features/admin/carriers/hooks/use-carrier-platforms";
import { isCatalogManagedPlatform } from "@/features/admin/carriers/lib/admin-carrier-settings";
import type { AdminCarrierPlatform } from "@/features/admin/carriers/types";

/**
 * Whether an admin can edit and delete a platform's carriers. Pass
 * `enabled: false` for roles that cannot manage carriers, so the platform
 * list is never requested for them.
 */
export function useIsCatalogManagedPlatform(
  options: { enabled?: boolean } = {},
) {
  const platformsQuery = useCarrierPlatforms(options);
  const platforms = platformsQuery.data;

  return useCallback(
    (platform: AdminCarrierPlatform | undefined) =>
      isCatalogManagedPlatform(platform, platforms),
    [platforms],
  );
}
