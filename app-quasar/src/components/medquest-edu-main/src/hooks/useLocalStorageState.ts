import { useState, useEffect } from "react";

/**
 * Persists state to localStorage. The `key` must be a stable string constant —
 * changing the key at runtime will not re-read from storage for the new key.
 */
export function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage quota exceeded or private browsing — fail silently
    }
  }, [key, state]);

  return [state, setState];
}
