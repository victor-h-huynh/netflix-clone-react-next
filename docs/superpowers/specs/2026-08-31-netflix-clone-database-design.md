# Netflix Clone — Database Design (Phase 2)

## Context

Phase 1 built the frontend (see
`2026-08-31-netflix-clone-frontend-design.md`): Next.js 15 (Pages
Router), Tailwind v4, shadcn/ui, live TMDB data via
`getServerSideProps`. "My List" was deliberately built as a
client-only `localStorage` hook (`src/hooks/useMyList.ts`) with a
stable `{ ids, isInList, toggle }` interface, explicitly designed as
the seam this phase replaces with a real backend.

The project already deploys to Vercel. Next.js API routes are the
backend runtime; `src/pages/api/` currently holds only the unused
`hello.ts` scaffold. There is no database, no auth, no server-side
persistence today.

## Goals

- Persist "My List" in a real SQL database instead of `localStorage`.
- Use **PostgreSQL** (hosted on Neon) so the project can legitimately
  list PostgreSQL on a resume and be explained in simple terms.
- Keep the feature as small as possible: one table, one API endpoint,
  three SQL statements, no ORM.
- Preserve the existing `useMyList` interface so no component changes.
- Work on the deployed Vercel site (rules out a local SQLite file,
  which serverless hosts cannot persist).

## Non-goals

- No authentication / login / user accounts. Identity is an anonymous
  per-browser cookie.
- No ORM (Prisma, Drizzle) and no migration tooling. A single
  `schema.sql` run once by hand.
- No `localStorage` fallback when the API is unreachable — keeps the
  data flow single-path and easy to describe.
- No new features beyond persistence (no watch history, ratings,
  profiles, sharing).
- No test runner (the repo has none; consistent with Phase 1).

## Architecture

### Hosting

- **Neon** — free serverless PostgreSQL. One project, one database.
  Connection string stored as `DATABASE_URL` in `.env.local`
  (git-ignored) locally and as a Vercel project env var in production.
- Neon scales to zero after ~5 min idle; the first query after idle
  pays a sub-second cold start. Acceptable for a non-critical "My
  List" feature.

### Data layer

- `src/lib/db.ts` — creates and exports a single `postgres` client
  (postgres.js) from `process.env.DATABASE_URL`. Throws a clear,
  actionable error at import time if the variable is missing
  (pointing at `.env.local` and the Neon dashboard). Module-level
  singleton so a serverless invocation reuses one connection.
- `src/lib/visitor.ts` — `getVisitorId(req, res): string`. Reads the
  `visitor_id` cookie; if absent, generates one with
  `crypto.randomUUID()` and sets it on the response:
  `visitor_id=<uuid>; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`.
- `schema.sql` (repo root) — the single table definition, run once
  against the Neon database (via Neon's SQL editor or `psql`):

  ```sql
  create table if not exists my_list (
    visitor_id  text        not null,
    movie_id    integer     not null,
    created_at  timestamptz not null default now(),
    primary key (visitor_id, movie_id)
  );
  ```

  The composite primary key gives idempotent adds (`ON CONFLICT DO
  NOTHING`) and a fast lookup by `visitor_id`.

### API layer

- `src/pages/api/my-list.ts` — one handler, branching on
  `req.method`. Every branch calls `getVisitorId(req, res)` first,
  then runs one parameterized query:

  | Method | Body / query        | SQL                                                                 | Response            |
  |--------|---------------------|--------------------------------------------------------------------|---------------------|
  | GET    | —                   | `select movie_id from my_list where visitor_id = $1`               | `{ ids: number[] }` |
  | POST   | `{ movieId: number }` | `insert into my_list (visitor_id, movie_id) values ($1, $2) on conflict do nothing` | `{ ok: true }`      |
  | DELETE | `?movieId=<number>` | `delete from my_list where visitor_id = $1 and movie_id = $2`      | `{ ok: true }`      |

  - Validate `movieId` is a positive integer; `400` on bad input.
  - Unknown method → `405` with an `Allow` header.
  - Any thrown error → `500` with a short JSON message; details to
    `console.error`.

### Client layer

- `src/hooks/useMyList.ts` — same public interface
  (`{ ids, isInList, toggle }`), new internals:
  - On mount: `GET /api/my-list`, populate `ids` from the response.
    The cookie rides along automatically.
  - `toggle(id)`: optimistically update local `ids`, then fire
    `POST` (add) or `DELETE` (remove). On failure, roll back the
    optimistic change and `console.error`. The page never throws.
  - Drop the `localStorage` read/write and the `STORAGE_KEY`
    constant.
  - The Phase 1 comment about per-instance `localStorage` staleness
    is now resolved: state is server-backed, though each hook
    instance still holds its own copy (a mount-time fetch), which is
    acceptable for this UI.

### Unchanged

`MovieCard`, `MovieRow`, `EmblaCarousel`, `HeroSection`, `Header`,
`Footer`, and `src/pages/my-list.tsx` all consume only the hook's
interface and need no changes.

## Data flow

1. A page mounts → `useMyList` calls `GET /api/my-list`.
2. The route calls `getVisitorId` (sets the cookie on first visit),
   runs the `SELECT`, returns `{ ids }`.
3. User clicks add/remove on a `MovieCard` → `toggle(id)` updates
   local state immediately and sends `POST` / `DELETE`.
4. The route scopes the `INSERT` / `DELETE` by `visitor_id` and
   returns `{ ok: true }`.
5. On a network/DB error the hook rolls back and logs; other
   features are unaffected.

## Error handling

- **Missing `DATABASE_URL`** — `db.ts` throws at import with a message
  naming `.env.local` and the Neon dashboard, so a misconfigured
  environment fails loudly and early rather than as an opaque runtime
  error.
- **DB unreachable / query error** — API returns `500`; hook rolls
  back optimistic state and logs. "My List" degrades to "shows
  nothing / toggles don't stick"; the rest of the site works.
- **Bad `movieId`** — API returns `400` before touching the database.
- **Cleared cookies** — the visitor's rows are orphaned in the table
  (acceptable with no auth); a fresh `visitor_id` is issued on the
  next request.

## Security / privacy

- `visitor_id` is a random UUID with no personal data — a functional
  cookie, no consent banner needed.
- `HttpOnly` keeps it out of client JS; `SameSite=Lax` limits
  cross-site sending.
- All SQL is parameterized (no string interpolation) — no injection
  surface.
- The Neon connection string is a secret: `.env.local` is
  git-ignored; production uses a Vercel env var.

## Testing

No test runner exists in the repo (consistent with Phase 1). Manual
verification, captured as a short checklist in
`docs/superpowers/` notes:

1. `npm run dev`, add a movie to My List, reload the page → the movie
   is still listed.
2. In the Neon SQL editor, `select * from my_list;` shows the row
   with a `visitor_id` and `movie_id`.
3. Open an incognito window → My List is empty (new `visitor_id`).
4. Remove a movie → after reload it is gone; the row is gone in Neon.
5. Temporarily unset `DATABASE_URL` → dev server / API surfaces the
   clear configuration error, not a silent failure.

## One-time setup (outside the code)

1. Create a free Neon account and project; copy the connection
   string.
2. Add `DATABASE_URL=<string>` to `.env.local`.
3. `npm install postgres`.
4. Run `schema.sql` once against the Neon database.
5. In Vercel project settings, add `DATABASE_URL` with the same
   value.

## How to describe it (resume / interview)

> The React frontend calls a Next.js API route. The route identifies
> the browser with an anonymous `HttpOnly` cookie, then runs three
> parameterized SQL queries (`SELECT` / `INSERT` / `DELETE`) against a
> PostgreSQL database hosted on Neon to store each visitor's saved
> movies. No ORM — plain SQL through a thin client, with a single
> `my_list` table keyed by visitor and movie id.

## Resolved decisions

1. **PostgreSQL over SQLite/Turso/Firebase** — resume value and
   transferable SQL skills; must work on Vercel, which rules out a
   local SQLite file.
2. **Neon as host** — free tier, scales to zero, pairs cleanly with
   Next.js/Vercel.
3. **Raw SQL over an ORM** — three queries; nothing to regenerate;
   what is learned is standard SQL.
4. **Anonymous cookie over auth** — smallest thing that makes
   per-browser lists behave realistically without a login.
5. **One API route file** with a method switch — "one endpoint" is
   simpler to hold in mind and to explain than three route files.
6. **No `localStorage` fallback** — single-path data flow is easier
   to reason about and describe.
