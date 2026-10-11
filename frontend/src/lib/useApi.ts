import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "./api";

type Result<T> = { key: string; data: T | null; error: ApiError | null };

// Remembers the last answer for each path while the app is open.
// Revisiting a page shows the remembered answer instantly, then quietly refreshes it.
const cache = new Map<string, unknown>();

// Must run on logout, so the next person to log in never sees your data.
export function clearApiCache() {
  cache.clear();
}

export function readApiCache<T>(path: string) {
  return cache.get(path) as T | undefined;
}

export function writeApiCache<T>(path: string, data: T) {
  cache.set(path, data);
}

// Loads a path in the background and remembers it, so the page is instant when you open it.
// Errors are ignored here; the page will show them if they happen again when it loads.
export function prefetch(path: string) {
  if (cache.has(path)) {
    return;
  }
  apiRequest(path).then(
    (data) => cache.set(path, data),
    () => {},
  );
}

// Forget every remembered answer whose path starts with `prefix`, e.g. "/discover".
export function invalidateApiCache(prefix: string) {
  for (const path of [...cache.keys()]) {
    if (path.startsWith(prefix)) {
      cache.delete(path);
    }
  }
}

// Change a remembered answer, e.g. remove someone from /matches right after unmatching.
export function updateApiCache<T>(path: string, change: (current: T) => T) {
  const current = cache.get(path) as T | undefined;
  if (current !== undefined) {
    cache.set(path, change(current));
  }
}

// Loads data from the API when a page opens (and again whenever `path` changes),
// tracking the states every network request has: loading, failed, or done.
// `placeholder` is shown while loading if there's nothing remembered yet.
export function useApi<T>(path: string, placeholder?: T) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  // Identifies one specific request. If it changes, the old answer is out of date.
  const key = path + "#" + version;

  useEffect(() => {
    let cancelled = false;
    apiRequest<T>(path).then(
      (data) => {
        cache.set(path, data);
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
  const setData = useCallback(
    (data: T) => {
      cache.set(path, data);
      setResult({ key, data, error: null });
    },
    [path, key],
  );

  const fresh = result?.key === key;
  const remembered = (cache.get(path) as T | undefined) ?? placeholder ?? null;
  const data = fresh ? result.data : remembered;

  return {
    data,
    error: fresh ? result.error : null,
    loading: !fresh && data === null,     // nothing to show yet
    refreshing: !fresh && data !== null,  // showing remembered data, checking for updates
    reload,
    setData,
  };
}
