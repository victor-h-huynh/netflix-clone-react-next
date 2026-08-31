import { useCallback, useEffect, useState } from "react";

// "My List" is stored server-side (Postgres via /api/my-list), scoped to an
// anonymous `visitor_id` cookie the API sets. Each hook instance loads its
// own copy on mount; a toggle in one MovieCard is not pushed to other mounted
// instances until they remount (same behavior as the Phase 1 client-side
// storage version — acceptable for this UI).

async function fetchIds(signal: AbortSignal): Promise<number[]> {
  const res = await fetch("/api/my-list", { signal });
  if (!res.ok) throw new Error(`GET /api/my-list -> ${res.status}`);
  const data = (await res.json()) as { ids?: unknown };
  return Array.isArray(data.ids) ? (data.ids as number[]) : [];
}

export function useMyList() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchIds(controller.signal)
      .then(setIds)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load My List:", err);
        }
      });
    return () => controller.abort();
  }, []);

  const isInList = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: number) => {
      const adding = !ids.includes(id);

      // optimistic update
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );

      const request = adding
        ? fetch("/api/my-list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId: id }),
          })
        : fetch(`/api/my-list?movieId=${id}`, { method: "DELETE" });

      request
        .then((res) => {
          if (!res.ok) throw new Error(`update /api/my-list -> ${res.status}`);
        })
        .catch((err) => {
          console.error("Failed to update My List:", err);
          // roll back the optimistic change
          setIds((current) =>
            adding ? current.filter((x) => x !== id) : [...current, id],
          );
        });
    },
    [ids],
  );

  return { ids, isInList, toggle };
}
