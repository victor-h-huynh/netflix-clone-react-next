# Netflix Clone — Frontend Design (Phase 1)

## Context

The repo already has a partially-built Netflix clone: Next.js 15 (Pages
Router), Tailwind v4, shadcn/ui, embla-carousel, next-themes. `Header`,
`Footer`, `HeroSection`, and `EmblaCarousel` exist. Movie data currently
comes from a static TMDB-shaped JSON fixture (`api-response-example.json`),
not a live API call.

A YouTube "one-prompt" tutorial was used as a feature checklist for a
Netflix-style frontend (React+Vite+CSS, local JS array data, no backend).
That prompt is being adapted, not followed literally — the existing stack
(Next.js, Tailwind, shadcn, TMDB API) is kept, and the video's "local JS
array" data instruction is overridden in favor of live TMDB calls, since a
TODO already in `index.tsx` calls for a real API integration and this sets
up Phase 2 (simple full-stack) more naturally.

## Goals

- Replace static movie fixture with live TMDB API data.
- Add multiple horizontal movie rows (Trending, Popular, Top 10, and
  genre-based rows), reusing/generalizing the existing carousel.
- Extract a standalone `MovieCard` component with a hover scale effect.
- Make the hero section dynamic (real featured title, not hardcoded).
- Align nav labels with the video checklist ("New & Popular").
- Add a client-side-only "My List" (localStorage), shaped so it can be
  swapped for a real backend later without changing the UI contract.
- Resolve existing TODOs: genre id → name mapping, carousel arrow/sizing
  polish, hero/carousel layout.

## Non-goals (explicitly out of scope for this phase)

- No backend server, database, or API routes proxying TMDB.
- No authentication / login screen (existing TODO, deferred to Phase 2).
- No persistence beyond `localStorage` for "My List".

These are deferred to a future Phase 2 (simple full-stack), reusing the
already-scaffolded `src/pages/api` directory, but are not designed here.

## Architecture

### Data layer

- `src/lib/tmdb.ts` — thin fetch wrapper around the TMDB v3 API
  (`fetchMovies(endpoint: string): Promise<Movie[]>`), reading the API key
  from `process.env.TMDB_API_KEY` (server-only env var, no `NEXT_PUBLIC_`
  prefix, since fetches happen in `getServerSideProps`).
- `src/lib/genres.ts` — static map of TMDB genre id → name (TMDB's genre
  list is small and stable; no need for a runtime fetch).
- `src/types/movie.ts` — `Movie` type matching the TMDB shape already
  present in `api-response-example.json`.
- Row data (title + TMDB endpoint) defined as a config array, e.g.:
  ```ts
  const ROWS = [
    { title: "Trending Now", endpoint: "/trending/movie/week" },
    { title: "Popular on Netflix", endpoint: "/movie/popular" },
    { title: "Top 10 Movies", endpoint: "/trending/movie/week", limit: 10 },
    { title: "Action Movies", endpoint: "/discover/movie?with_genres=28" },
    { title: "Comedy Movies", endpoint: "/discover/movie?with_genres=35" },
    { title: "Horror Movies", endpoint: "/discover/movie?with_genres=27" },
    { title: "Sci-Fi Movies", endpoint: "/discover/movie?with_genres=878" },
  ];
  ```
- `src/pages/index.tsx` fetches all rows in `getServerSideProps` (parallel
  `Promise.all`) and passes them as props — keeps the TMDB key server-side
  and avoids a client-side loading waterfall.

### Components

- `Header` (existing) — rename "Recently Added" → "New & Popular" in both
  the desktop nav and the mobile dropdown. No other structural change;
  search/notifications/avatar already present.
- `HeroSection` (existing, modified) — accept a `movie: Movie` prop instead
  of hardcoded text/image; `index.tsx` picks the first trending result as
  the featured title.
- `MovieRow` (new, replaces direct use of `EmblaCarousel` in `index.tsx`) —
  wraps `EmblaCarousel`, takes `{ title: string; movies: Movie[] }`, renders
  the row heading and delegates card rendering to `MovieCard`.
- `EmblaCarousel` (existing, generalized) — keep scroll/arrow logic, but
  stop importing the static JSON; accept `movies: Movie[]` as a prop and
  render `MovieCard` per slide instead of inline `<img>` + `Dialog`.
- `MovieCard` (new) — extracted from `EmblaCarousel`'s current per-slide
  markup: poster image, hover scale transition, wraps the existing shadcn
  `Dialog` for the "more info" popup (title, release date, vote average,
  genre names via `src/lib/genres.ts`, overview, Play button). Also renders
  an add/remove "My List" toggle button.
- `Footer` (existing) — no change.

### "My List" (client-only)

- `src/hooks/useMyList.ts` — a small hook wrapping `localStorage`
  (`myList: number[]` of movie ids), exposing `list`, `isInList(id)`,
  `toggle(id)`. Read/write guarded for SSR (`typeof window`).
- `MovieCard` uses the hook to show a filled/outline icon and toggle
  membership.
- A `/my-list` page (or a filtered section on the home page — see open
  question below) reads the hook and fetches/display those specific movies.
- This hook is the seam Phase 2 will replace: same `isInList`/`toggle`
  interface, backed by an API call + DB instead of `localStorage`.

## Data flow

1. `getServerSideProps` in `index.tsx` calls `fetchMovies` once per
   configured row (parallel), plus resolves the hero's featured movie.
2. Props flow down: `index.tsx` → `HeroSection` (single movie) and
   `index.tsx` → `MovieRow` (per row) → `EmblaCarousel` → `MovieCard`
   (per movie).
3. `MovieCard` reads/writes "My List" state client-side via `useMyList`;
   no network round-trip.

## Error handling

- If a TMDB fetch fails (bad/missing API key, network error), catch in
  `getServerSideProps` and return an empty array for that row rather than
  failing the whole page — degrade gracefully, one broken row shouldn't
  blank the homepage.
- Missing `TMDB_API_KEY` at build/dev time should throw a clear error
  message pointing at `.env.local`, rather than a silent 401 from TMDB.

## Testing

- No existing test setup in the repo (no test runner configured). Given
  this is a visual/UI-heavy frontend project, manual verification via
  `npm run dev` in the browser is the primary check, consistent with how
  the project has been built so far.
- Sanity-check: genre id → name mapping renders correctly, hover scale
  works, all 7 rows load without breaking the page if one TMDB call fails,
  responsive layout holds at mobile/tablet/desktop breakpoints, "My List"
  toggle persists across a page reload.

## Open questions

1. **"My List" page** — a dedicated `/my-list` route, or a filtered
   section injected into the homepage? (Video's nav has "My List" as a
   link, implying a separate page.)
2. **TMDB API key** — do you already have a TMDB account/API key, or does
   that need to be signed up for before this can run end-to-end?
