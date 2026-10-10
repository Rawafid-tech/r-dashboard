import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { postShipmentPreview } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import {
  draftsToPreviewPayload,
  stablePreviewKey,
} from "@/features/shipments/lib/bulk-preview-lines";
import type {
  BulkBookingLineDraft,
  BulkPreviewResponse,
} from "@/features/shipments/types";

const PREVIEW_DEBOUNCE_MS = 300;

interface UseBulkShipmentPreviewOptions {
  enabled?: boolean;
}

export function useBulkShipmentPreview(
  drafts: BulkBookingLineDraft[],
  options: UseBulkShipmentPreviewOptions = {},
) {
  const enabled = options.enabled ?? true;
  const queryClient = useQueryClient();
  const [debouncedLines, setDebouncedLines] = useState(() =>
    draftsToPreviewPayload(drafts),
  );
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const next = draftsToPreviewPayload(drafts);
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      setDebouncedLines(next);
      debounceRef.current = null;
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [drafts]);

  const previewKey = stablePreviewKey(debouncedLines);
  const hasLines = debouncedLines.length > 0;

  const query = useQuery({
    queryKey: shipmentKeys.bulkPreview(debouncedLines),
    queryFn: ({ signal }) => postShipmentPreview({ lines: debouncedLines }, signal),
    enabled: enabled && hasLines,
    staleTime: 0,
    retry: false,
    placeholderData: (previous) => previous,
  });

  const refetchNow = () => {
    if (!hasLines) return Promise.resolve(undefined);
    return queryClient.fetchQuery({
      queryKey: shipmentKeys.bulkPreview(debouncedLines),
      queryFn: ({ signal }) =>
        postShipmentPreview({ lines: debouncedLines }, signal),
    }) as Promise<BulkPreviewResponse>;
  };

  return {
    ...query,
    previewKey,
    debouncedLines,
    refetchNow,
    isDebouncing: previewKey !== stablePreviewKey(draftsToPreviewPayload(drafts)),
  };
}
