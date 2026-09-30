import { useCallback, useEffect, useRef, useState } from "react";
import { testCarrierConnection } from "@/features/shipping-partners/api/shipping-partners.api";
import type { TestConnectionResult } from "@/features/shipping-partners/types";

/**
 * Tests a carrier key without putting the secret in the React Query cache.
 * The in-flight request is aborted on unmount and when `reset` runs.
 */
export function useTestCarrierConnection() {
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (mountedRef.current) setIsPending(false);
  }, []);

  const test = useCallback(
    async (
      code: string,
      credentials: Record<string, string>,
    ): Promise<TestConnectionResult> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (mountedRef.current) setIsPending(true);

      try {
        return await testCarrierConnection(
          code,
          credentials,
          controller.signal,
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          if (mountedRef.current) setIsPending(false);
        }
      }
    },
    [],
  );

  return { test, isPending, reset };
}
