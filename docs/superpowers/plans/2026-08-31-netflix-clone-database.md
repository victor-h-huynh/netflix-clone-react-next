# Netflix Clone Database (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `localStorage`-backed "My List" with a PostgreSQL-backed one: a single `my_list` table on Neon, one Next.js API route, and an anonymous per-browser cookie for identity — with no change to any component.

**Architecture:** A single API route (`/api/my-list`) is the backend. It identifies the browser with an anonymous `HttpOnly` `visitor_id` cookie (a random UUID it sets on first contact), then runs one parameterized SQL statement per HTTP method (`GET` = SELECT, `POST` = INSERT, `DELETE` = DELETE) against a Neon-hosted PostgreSQL database through the thin `postgres` (postgres.js) client. The `useMyList` hook keeps its exact `{ ids, isInList, toggle }` interface; only its internals change from `localStorage` to `fetch`.

**Tech Stack:** Next.js 15 (Pages Router), TypeScript, `postgres` (postgres.js) client, PostgreSQL on Neon (free tier), Node `crypto.randomUUID`.

**Spec:** `docs/superpowers/specs/2026-08-31-netflix-clone-database-design.md`

## Global Constraints

- **Database:** PostgreSQL, hosted on Neon (free tier). Connection string in `process.env.DATABASE_URL` — in `.env.local` locally (git-ignored via `.env*`), and a Vercel project env var in production. Use Neon's **pooled** connection string (host contains `-pooler`).
- **No ORM, no migration tool.** One `schema.sql` at the repo root, run once by hand against Neon.
- **No authentication.** Identity is an anonymous `visitor_id` cookie: random UUID, `Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`.
- **No `localStorage` fallback.** If the API/DB is unreachable, "My List" shows empty and toggles roll back with a `console.error`; the rest of the site is unaffected.
- **`useMyList` public interface is frozen:** `{ ids: number[]; isInList(id: number): boolean; toggle(id: number): void }`. No consumer component (`MovieCard`, `my-list.tsx`) may be edited.
- **All SQL parameterized** through `postgres` tagged templates — never string-interpolate user input.
- **No test runner** exists in this repo (consistent with Phase 1). Each task ends with an explicit **manual verification** step (shell `curl`, a one-off Node check, the Neon SQL editor, or the browser) followed by a commit.
- Import alias: `@/*` → `./src/*`.
- Never commit `.env.local`.

---

### Task 1: Database setup and connection module

**Files:**
- Create: `schema.sql` (repo root)
- Create: `src/lib/db.ts`
- Modify: `package.json` (adds `postgres` dependency — done by `npm install`)
- Modify (not committed): `.env.local` (adds `DATABASE_URL`)

**Interfaces:**
- Consumes: nothing.
- Produces: `sql` — the configured postgres.js client — exported from `src/lib/db.ts`:
  `import { sql } from "@/lib/db"`. It is a tagged-template function:
  `` await sql<{ movie_id: number }[]>`select ...` `` returns an array-like `RowList`.

**Prerequisite (one-time, outside the code — do this first):**
1. Create a free account at https://neon.com and a new project (any name; default Postgres version is fine).
2. In the project dashboard open **Connection Details**, toggle **Connection pooling** ON, and copy the connection string. It looks like
   `postgresql://<user>:<password>@ep-xxxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require`
   (note the `-pooler` in the host and `?sslmode=require` at the end — keep the whole string, query params included).

- [ ] **Step 1: Install the client**

Run:
```bash
npm install postgres
```
Expected: `package.json` gains `"postgres": "^3.x"` under `dependencies`; `package-lock.json` updates.

- [ ] **Step 2: Add the connection string to `.env.local`**

Append one line to `.env.local` (create the file if missing — it already exists in this repo with the TMDB keys). Paste the exact pooled string from the prerequisite:
```
DATABASE_URL=postgresql://<user>:<password>@ep-xxxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require
```
Do **not** commit this file (`.gitignore` already ignores `.env*`).

- [ ] **Step 3: Create `schema.sql`**

```sql
-- schema.sql — run once against the Neon database
-- (Neon dashboard -> SQL Editor -> paste -> Run).

create table if not exists my_list (
  visitor_id  text        not null,
  movie_id    integer     not null,
  created_at  timestamptz not null default now(),
  primary key (visitor_id, movie_id)
);
```

- [ ] **Step 4: Run the schema against Neon**

In the Neon dashboard, open **SQL Editor**, paste the contents of `schema.sql`, and run it.
Then run this query in the same editor to confirm:
```sql
select table_name from information_schema.tables where table_name = 'my_list';
```
Expected: one row, `my_list`.

- [ ] **Step 5: Create the connection module**

```ts
// src/lib/db.ts
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL. Add your Neon connection string to .env.local. " +
      "Get it from the Neon dashboard -> Connection Details -> enable " +
      "Connection pooling -> copy the connection string.",
  );
}

// Neon's pooled endpoint runs PgBouncer in transaction mode, which does not
// support session-level prepared statements — so `prepare: false`. `max: 1`
// keeps each serverless invocation to a single connection. SSL is taken from
// `?sslmode=require` in the connection string.
export const sql = postgres(connectionString, { max: 1, prepare: false });
```

- [ ] **Step 6: Manual verification — connect and query**

Run (Node 20.6+ supports `--env-file`):
```bash
node --env-file=.env.local -e "const postgres=require('postgres'); const sql=postgres(process.env.DATABASE_URL,{max:1,prepare:false}); sql\`select 1 as ok\`.then(r=>{console.log('OK', r[0]); return sql.end();}).catch(e=>{console.error('FAIL', e.message); process.exit(1);});"
```
Expected: prints `OK { ok: 1 }` and exits 0.
If it prints `FAIL ...`: re-check the connection string (must be the pooled one, with `?sslmode=require`).

- [ ] **Step 7: Commit**

```bash
git add schema.sql src/lib/db.ts package.json package-lock.json
git commit -m "feat: add Neon Postgres connection module and my_list schema"
```
(`git status` should show `.env.local` as untracked/ignored — do not add it.)

---

### Task 2: The `/api/my-list` route (with the visitor-cookie helper)

**Files:**
- Create: `src/lib/visitor.ts`
- Create: `src/pages/api/my-list.ts`
- Test: none (no runner) — verified with `curl` and the Neon SQL editor in Step 6.

**Interfaces:**
- Consumes: `sql` from `@/lib/db` (Task 1).
- Produces:
  - `getVisitorId(req: NextApiRequest, res: NextApiResponse): string` from `@/lib/visitor` — returns the existing `visitor_id` cookie value, or generates a UUID and sets the `Set-Cookie` header on `res` before returning it.
  - HTTP endpoint `/api/my-list`:
    - `GET` → `200 { ids: number[] }`
    - `POST` body `{ movieId: number }` → `200 { ok: true }` | `400 { error }`
    - `DELETE` `?movieId=<number>` → `200 { ok: true }` | `400 { error }`
    - other methods → `405 { error }` with `Allow: GET, POST, DELETE`
    - any DB error → `500 { error: "Database error" }`

- [ ] **Step 1: Create the visitor-cookie helper**

```ts
// src/lib/visitor.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";

const COOKIE_NAME = "visitor_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Returns a stable anonymous id for the calling browser. Reads the
 * `visitor_id` cookie if present; otherwise mints a UUID and sets it as an
 * HttpOnly cookie on the response. No personal data — a functional cookie.
 */
export function getVisitorId(
  req: NextApiRequest,
  res: NextApiResponse,
): string {
  const existing = req.cookies[COOKIE_NAME];
  if (existing) return existing;

  const id = randomUUID();
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_SECONDS}`,
  );
  return id;
}
```

- [ ] **Step 2: Create the API route**

```ts
// src/pages/api/my-list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@/lib/db";
import { getVisitorId } from "@/lib/visitor";

function parseMovieId(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const visitorId = getVisitorId(req, res);

  try {
    if (req.method === "GET") {
      const rows = await sql<{ movie_id: number }[]>`
        select movie_id from my_list where visitor_id = ${visitorId}
      `;
      return res.status(200).json({ ids: rows.map((r) => r.movie_id) });
    }

    if (req.method === "POST") {
      const movieId = parseMovieId(req.body?.movieId);
      if (movieId === null) {
        return res
          .status(400)
          .json({ error: "movieId must be a positive integer" });
      }
      await sql`
        insert into my_list (visitor_id, movie_id)
        values (${visitorId}, ${movieId})
        on conflict do nothing
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const movieId = parseMovieId(req.query.movieId);
      if (movieId === null) {
        return res
          .status(400)
          .json({ error: "movieId must be a positive integer" });
      }
      await sql`
        delete from my_list
        where visitor_id = ${visitorId} and movie_id = ${movieId}
      `;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[api/my-list] query failed:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
```

- [ ] **Step 3: Start the dev server**

Run:
```bash
npm run dev
```
Leave it running. Base URL is `http://localhost:3000`.

- [ ] **Step 4: Manual verification — empty GET sets the cookie**

Run:
```bash
curl -i -c cookies.txt http://localhost:3000/api/my-list
```
Expected: `HTTP/1.1 200`, a `Set-Cookie: visitor_id=...; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000` header, and body `{"ids":[]}`.

- [ ] **Step 5: Manual verification — POST then GET then DELETE (reusing the cookie)**

Run:
```bash
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/my-list \
  -H "Content-Type: application/json" -d '{"movieId":550}'
curl -s -b cookies.txt http://localhost:3000/api/my-list
curl -s -b cookies.txt -X DELETE "http://localhost:3000/api/my-list?movieId=550"
curl -s -b cookies.txt http://localhost:3000/api/my-list
```
Expected, in order: `{"ok":true}` / `{"ids":[550]}` / `{"ok":true}` / `{"ids":[]}`.

Then check bad input and method:
```bash
curl -s -b cookies.txt -X POST http://localhost:3000/api/my-list \
  -H "Content-Type: application/json" -d '{"movieId":"abc"}'
curl -s -i -b cookies.txt -X PUT http://localhost:3000/api/my-list | head -n 1
```
Expected: `{"error":"movieId must be a positive integer"}` then `HTTP/1.1 405`.

- [ ] **Step 6: Manual verification — the row really hits Postgres**

Run Step 5's POST once more (`movieId:550`), then in the Neon SQL Editor:
```sql
select visitor_id, movie_id from my_list;
```
Expected: one row, `movie_id = 550`, `visitor_id` a UUID. Then clean up:
```sql
delete from my_list;
```

- [ ] **Step 7: Commit**

```bash
rm cookies.txt
git add src/lib/visitor.ts src/pages/api/my-list.ts
git commit -m "feat: add /api/my-list route backed by Postgres with anonymous visitor cookie"
```

---

### Task 3: Point `useMyList` at the API

**Files:**
- Modify: `src/hooks/useMyList.ts` (full rewrite of the body; interface unchanged)
- Create: `docs/superpowers/phase-2-manual-test-checklist.md`
- Test: none (no runner) — verified in the browser in Step 4.

**Interfaces:**
- Consumes: `GET/POST/DELETE /api/my-list` (Task 2). The `visitor_id` cookie is sent automatically by the browser; the hook never reads it.
- Produces: unchanged public interface —
  `useMyList(): { ids: number[]; isInList(id: number): boolean; toggle(id: number): void }`.
  Consumers (`MovieCard`, `src/pages/my-list.tsx`) are untouched.

- [ ] **Step 1: Rewrite the hook**

Replace the entire contents of `src/hooks/useMyList.ts` with:

```ts
import { useCallback, useEffect, useState } from "react";

// "My List" is stored server-side (Postgres via /api/my-list), scoped to an
// anonymous `visitor_id` cookie the API sets. Each hook instance loads its
// own copy on mount; a toggle in one MovieCard is not pushed to other mounted
// instances until they remount (same behavior as the Phase 1 localStorage
// version — acceptable for this UI).

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
```

- [ ] **Step 2: Type-check and lint**

Run:
```bash
npx tsc --noEmit && npm run lint
```
Expected: both pass with no errors. (No references to the removed `STORAGE_KEY` / `localStorage` remain.)

- [ ] **Step 3: Confirm no other file referenced the old internals**

Run:
```bash
grep -rn "netflix-clone-my-list\|localStorage" src/
```
Expected: no matches (the only occurrences were inside `useMyList.ts`, now gone).

- [ ] **Step 4: Manual verification — full round trip in the browser**

With `npm run dev` running, in a normal browser window at `http://localhost:3000`:
1. Open a movie's dialog, click **My List** — the button flips to **In My List**.
2. Reload the page, reopen the same movie — it still shows **In My List**.
3. Open `http://localhost:3000/my-list` — the movie appears in the grid.
4. In the Neon SQL Editor: `select * from my_list;` — one row for that `movie_id`.
5. Back on the home page, toggle the movie **off**; reload — it shows **My List** again; the Neon row is gone.
6. Open an **incognito/private** window at `http://localhost:3000/my-list` — the list is empty (a different `visitor_id` cookie).
7. In DevTools → Network, confirm `/api/my-list` requests return `200`. In the Console there are no errors.

- [ ] **Step 5: Write the manual-test checklist doc**

```markdown
<!-- docs/superpowers/phase-2-manual-test-checklist.md -->
# Phase 2 (Database) — Manual Test Checklist

Prereq: `DATABASE_URL` set in `.env.local` (Neon pooled string); `schema.sql`
has been run against the Neon database; `npm run dev` running.

1. Add a movie to My List from the home page → button shows "In My List".
2. Reload → still "In My List" (state came from Postgres, not memory).
3. `/my-list` page lists the movie.
4. Neon SQL Editor: `select * from my_list;` shows the row (visitor_id + movie_id).
5. Remove the movie → reload → gone from the page and from the Neon table.
6. Incognito window → `/my-list` is empty (separate anonymous visitor_id cookie).
7. Unset `DATABASE_URL` and restart dev → `/api/my-list` returns 500, the
   page still renders, My List is empty, console shows "Failed to load My List".
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useMyList.ts docs/superpowers/phase-2-manual-test-checklist.md
git commit -m "feat: back useMyList with /api/my-list instead of localStorage"
```

---

## Deployment (after all tasks pass)

Not a code task — do this when deploying to Vercel:

1. Vercel project → **Settings → Environment Variables** → add `DATABASE_URL` with the same Neon **pooled** connection string, for all environments (Production, Preview, Development).
2. Redeploy.
3. The Neon `my_list` table is shared between local and deployed environments (same database) unless you create a separate Neon project/branch for production — optional, not required for this project.
4. Smoke test the deployed URL with the checklist above (browser steps 1–6).

---

## Self-Review

**1. Spec coverage:**
- Neon hosting + `DATABASE_URL` in `.env.local` / Vercel → Task 1 (Steps 1–2), Deployment.
- `src/lib/db.ts` singleton + clear error on missing env → Task 1 Step 5.
- `src/lib/visitor.ts` `getVisitorId` + cookie attributes → Task 2 Step 1.
- `schema.sql` one table, composite PK → Task 1 Step 3–4.
- One API route, method switch, three parameterized statements, 400/405/500 → Task 2 Step 2, verified Steps 4–6.
- `useMyList` interface frozen, `localStorage` removed, optimistic + rollback, load on mount → Task 3 Step 1, verified Steps 2–4.
- Components unchanged → Task 3 Step 3 (grep) + Step 2 (tsc/lint).
- Error handling (missing env, DB unreachable, bad movieId, cleared cookie) → Task 1 Step 6, Task 2 Step 5, Task 3 Step 5 item 7, spec §"Security / privacy".
- Testing = manual checklist, no runner → every task's verification step + Task 3 Step 5 doc.
- "How to describe it" / resolved decisions → carried in the spec (travels with this plan).

No gaps found.

**2. Placeholder scan:** No `TBD`/`TODO`/"handle edge cases"/"similar to Task N". Every code step has full code; every verification step has the exact command and expected output.

**3. Type consistency:**
- `sql` from `@/lib/db` — tagged template, used identically in Task 2 (`sql<{ movie_id: number }[]>\`...\``, `sql\`insert...\``, `sql\`delete...\``).
- `getVisitorId(req, res): string` — defined Task 2 Step 1, called Task 2 Step 2 with `(req, res)`.
- `parseMovieId(raw: unknown): number | null` — defined and used within Task 2 Step 2 only.
- Endpoint contract (`{ ids: number[] }`, `{ ok: true }`, `{ error: string }`) — produced Task 2, consumed Task 3 (`data.ids` array check, `res.ok` check). Consistent.
- `useMyList()` return shape identical to the pre-existing hook consumed by `MovieCard` / `my-list.tsx`. Consistent.

No issues found.
