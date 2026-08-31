import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "netflix-clone-my-list";

export function useMyList() {
  const [ids, setIds] = useState<number[]>([]);

  // Each hook instance loads its own copy from localStorage on mount, so
  // two MovieCards showing the same movie in different rows won't reflect
  // a toggle in one until the other remounts. Acceptable for a
  // localStorage-only MVP; Phase 2 replaces this with shared server state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIds(JSON.parse(stored));
    }
  }, []);

  const isInList = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback((id: number) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { ids, isInList, toggle };
}
