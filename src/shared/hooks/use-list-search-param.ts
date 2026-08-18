import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface UseListSearchParamOptions {
  paramKey?: string;
  delay?: number;
}

/**
 * Local search input with debounced API + URL sync.
 * URL updates only after debounce so typing does not re-render the route on every key.
 */
export function useListSearchParam(
  searchParams: URLSearchParams,
  updateParams: (updates: Record<string, string | null>) => void,
  options: UseListSearchParamOptions = {},
) {
  const { paramKey = "q", delay = 300 } = options;

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get(paramKey) ?? "",
  );
  const debouncedSearch = useDebounce(searchInput.trim(), delay);

  useEffect(() => {
    const urlValue = (searchParams.get(paramKey) ?? "").trim();
    if (urlValue === debouncedSearch) return;

    updateParams({
      [paramKey]: debouncedSearch || null,
      page: null,
    });
  }, [debouncedSearch, paramKey, searchParams, updateParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  return {
    searchInput,
    debouncedSearch,
    handleSearchChange,
    setSearchInput,
  };
}
