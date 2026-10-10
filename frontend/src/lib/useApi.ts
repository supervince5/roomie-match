import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "./api";

type Result<T> = { key: string; data: T | null; error: ApiError | null };

// Loads data from the API when a page opens (and again whenever `path` changes),
// tracking the three states every network request has: loading, failed, or done.
export function useApi<T>(path: string) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  // Identifies one specific request. If it changes, the old answer is out of date.
  const key = path + "#" + version;

  useEffect(() => {
    let cancelled = false;
    apiRequest<T>(path).then(
      (data) => {
        if (!cancelled) setResult({ key, data, error: null });
      },
      (caught) => {
        const error = caught instanceof ApiError ? caught : new ApiError(0, "Something went wrong.");
        if (!cancelled) setResult({ key, data: null, error });
      },
    );
    // If the path changes before this request finishes, ignore its late answer
    return () => {
      cancelled = true;
    };
  }, [path, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback((data: T) => setResult({ key, data, error: null }), [key]);

  return {
    data: result?.data ?? null,
    error: result?.key === key ? result.error : null,
    loading: result?.key !== key,
    reload,
    setData,
  };
}
