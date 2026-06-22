import { useEffect, useState } from "react";

/** Debounce any fast-changing value (typically a search input) before it
 * triggers an API call. Used by the project search bar. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
