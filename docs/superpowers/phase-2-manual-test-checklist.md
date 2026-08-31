# Phase 2 (Database) — Manual Test Checklist

Prereq: `DATABASE_URL` set in `.env.local` (Neon pooled string); `schema.sql`
has been run against the Neon database; `npm run dev` running.

Note: Phase 2 does not migrate any pre-existing browser `localStorage` "My List"
from Phase 1 — those entries are simply abandoned, which is intentional (the
spec's "no localStorage fallback" non-goal).

1. Add a movie to My List from the home page → button shows "In My List".
2. Reload → still "In My List" (state came from Postgres, not memory).
3. `/my-list` page lists the movie.
4. Neon SQL Editor: `select * from my_list;` shows the row (visitor_id + movie_id).
5. Remove the movie → reload → gone from the page and from the Neon table.
6. Incognito window → `/my-list` is empty (separate anonymous visitor_id cookie).
7. Unset `DATABASE_URL` and restart dev → `/api/my-list` returns 500, the
   page still renders, My List is empty, console shows "Failed to load My List".
