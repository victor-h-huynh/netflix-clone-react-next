import { useEffect, useState } from "react";

// "My List" is stored server-side (Postgres via /api/my-list), scoped to an
// anonymous `visitor_id` cookie the API sets. Every MovieCard calls this hook,
// so the fetch and the id list are shared in module scope: the first mounted
// instance triggers ONE `GET /api/my-list`, its result is cached, and all
// instances subscribe to a single store. A toggle in one card updates that
// shared store optimistically and notifies every subscriber, so the change is
// reflected everywhere immediately; on request failure the store is rolled
// back and subscribers are notified again.

type Subscriber = (ids: number[]) => void;

let cache: number[] | null = null;
let inFlight: Promise<number[]> | null = null;
const subscribers = new Set<Subscriber>();

function notify() {
  const snapshot = cache ?? [];
  for (const sub of subscribers) sub(snapshot);
}

function setCache(next: number[]) {
  cache = next;
  notify();
}

// Kicks off exactly one GET across the whole app. Safe to call from many
// instances; subsequent calls return the cache or the pending promise.
function loadOnce(): Promise<number[]> {
  if (cache !== null) return Promise.resolve(cache);
  if (inFlight !== null) return inFlight;

  inFlight = fetch("/api/my-list")
    .then((res) => {
      if (!res.ok) throw new Error(`GET /api/my-list -> ${res.status}`);
      return res.json() as Promise<{ ids?: unknown }>;
    })
    .then((data) => {
      const ids = Array.isArray(data.ids) ? (data.ids as number[]) : [];
      cache = ids;
      inFlight = null;
      notify();
      return ids;
    })
    .catch((err) => {
      // Never throw out of the hook: a failed load leaves the list empty.
      console.error("Failed to load My List:", err);
      cache = [];
      inFlight = null;
      notify();
      return cache;
    });

  return inFlight;
}

export function useMyList() {
  const [ids, setIds] = useState<number[]>(cache ?? []);

  useEffect(() => {
    subscribers.add(setIds);
    loadOnce();
    return () => {
      subscribers.delete(setIds);
    };
  }, []);

  const isInList = (id: number) => ids.includes(id);

  const toggle = (id: number) => {
    const current = cache ?? [];
    const adding = !current.includes(id);

    // optimistic update to the shared store
    setCache(
      adding ? [...current, id] : current.filter((x) => x !== id),
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
        // roll the shared store back
        const now = cache ?? [];
        setCache(
          adding ? now.filter((x) => x !== id) : [...now, id],
        );
      });
  };

  return { ids, isInList, toggle };
}
