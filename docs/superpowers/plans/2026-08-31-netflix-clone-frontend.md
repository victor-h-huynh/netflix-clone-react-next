# Netflix Clone Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static movie fixture with live TMDB data, generalize the carousel into reusable `MovieRow`/`MovieCard` components across 7 rows, make the hero dynamic, and add a localStorage-backed "My List" with its own page.

**Architecture:** Server-rendered home page (`getServerSideProps`) fetches all rows + the hero movie from TMDB in parallel using a server-only API key. `EmblaCarousel` is generalized to take a `movies` prop and render the new `MovieCard` per slide; `MovieRow` wraps it with a heading. A `useMyList` hook persists favorited movie ids to `localStorage`; `MovieCard` exposes a toggle button, and a new `/my-list` page fetches details for those ids client-side using a public TMDB key.

**Tech Stack:** Next.js 15 (Pages Router), TypeScript, Tailwind v4, shadcn/ui (Dialog, Button, DropdownMenu), embla-carousel-react, lucide-react, TMDB API v3.

**Spec:** `docs/superpowers/specs/2026-08-31-netflix-clone-frontend-design.md`

## Global Constraints

- No backend server, database, or authentication (Phase 1 is frontend-only; TMDB is called directly).
- TMDB key for server fetches: `process.env.TMDB_API_KEY` (already in `.env.local`, git-ignored).
- TMDB key for the one client-side fetch (`/my-list` page): `process.env.NEXT_PUBLIC_TMDB_API_KEY` (already in `.env.local`).
- "My List" persistence is `localStorage` only — no network round-trip for list membership.
- A failed TMDB row fetch must degrade to an empty row, not break the page.
- Nav label is "New & Popular" (not "Recently Added") per the video checklist.

---

### Task 1: TMDB data layer

**Files:**
- Create: `src/types/movie.ts`
- Create: `src/lib/genres.ts`
- Create: `src/lib/tmdb.ts`

**Interfaces:**
- Produces: `Movie` type (`src/types/movie.ts`), `GENRE_MAP: Record<number, string>` and `genreNames(ids: number[]): string` (`src/lib/genres.ts`), `fetchMovies(endpoint: string): Promise<Movie[]>` and `ROWS: { title: string; endpoint: string; limit?: number }[]` (`src/lib/tmdb.ts`) — all consumed by later tasks.

- [ ] **Step 1: Create the `Movie` type**

```ts
// src/types/movie.ts
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}
```

- [ ] **Step 2: Create the genre map**

```ts
// src/lib/genres.ts
export const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export function genreNames(ids: number[]): string {
  return ids
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .join(", ");
}
```

- [ ] **Step 3: Create the TMDB fetch wrapper and row config**

```ts
// src/lib/tmdb.ts
import { Movie } from "@/types/movie";

const TMDB_BASE = "https://api.themoviedb.org/3";

function requireServerApiKey(): string {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing TMDB_API_KEY environment variable. Add it to .env.local."
    );
  }
  return apiKey;
}

export async function fetchMovies(endpoint: string): Promise<Movie[]> {
  const apiKey = requireServerApiKey();
  const separator = endpoint.includes("?") ? "&" : "?";
  const res = await fetch(`${TMDB_BASE}${endpoint}${separator}api_key=${apiKey}`);
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.results as Movie[];
}

export const ROWS: { title: string; endpoint: string; limit?: number }[] = [
  { title: "Trending Now", endpoint: "/trending/movie/week" },
  { title: "Popular on Netflix", endpoint: "/movie/popular" },
  { title: "Top 10 Movies", endpoint: "/trending/movie/week", limit: 10 },
  { title: "Action Movies", endpoint: "/discover/movie?with_genres=28" },
  { title: "Comedy Movies", endpoint: "/discover/movie?with_genres=35" },
  { title: "Horror Movies", endpoint: "/discover/movie?with_genres=27" },
  { title: "Sci-Fi Movies", endpoint: "/discover/movie?with_genres=878" },
];
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing the three new files.

- [ ] **Step 5: Commit**

```bash
git add src/types/movie.ts src/lib/genres.ts src/lib/tmdb.ts
git commit -m "feat: add TMDB data layer (types, genre map, fetch wrapper, row config)"
```

---

### Task 2: `useMyList` hook

**Files:**
- Create: `src/hooks/useMyList.ts`

**Interfaces:**
- Produces: `useMyList(): { ids: number[]; isInList: (id: number) => boolean; toggle: (id: number) => void }` — consumed by `MovieCard` (Task 4) and `/my-list` (Task 7).

- [ ] **Step 1: Implement the hook**

```ts
// src/hooks/useMyList.ts
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/hooks/useMyList.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMyList.ts
git commit -m "feat: add localStorage-backed useMyList hook"
```

---

### Task 3: `MovieCard` component

**Files:**
- Create: `src/components/MovieCard.tsx`

**Interfaces:**
- Consumes: `Movie` (Task 1), `genreNames` (Task 1), `useMyList` (Task 2), existing `Button` and `Dialog*` from `src/components/ui/`.
- Produces: `MovieCard({ movie: Movie }): JSX.Element` — consumed by `EmblaCarousel` (Task 4) and `/my-list` (Task 7).

- [ ] **Step 1: Implement the component**

```tsx
// src/components/MovieCard.tsx
import { Play, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Movie } from "@/types/movie";
import { genreNames } from "@/lib/genres";
import { useMyList } from "@/hooks/useMyList";

export function MovieCard({ movie }: { movie: Movie }) {
  const { isInList, toggle } = useMyList();
  const inList = isInList(movie.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="sm:w-[22vw] lg:w-55 xl:w-68 2xl:w-80 transition-transform duration-200 hover:scale-105 cursor-pointer">
          <img
            className="rounded-sm sm:h-[25vh] lg:h-100 xl:h-140 2xl:h-180 object-cover w-full"
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            alt={movie.title}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="lg:!max-w-[90vw] lg:flex lg:flex-row lg:p-0">
        <img
          className="lg:h-auto lg:max-h-[35vh] xl:max-h-[46vh]"
          src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
          alt={movie.title}
        />
        <DialogHeader className="lg:flex-1 lg:p-6 lg:overflow-y-auto text-left">
          <DialogTitle className="lg:text-5xl xl:text-6xl">
            {movie.title}
          </DialogTitle>
          <DialogDescription className="lg:text-2xl xl:text-3xl">
            Release Date: {movie.release_date}
          </DialogDescription>
          <DialogDescription className="lg:text-2xl xl:text-3xl">
            Vote Average: {movie.vote_average}
          </DialogDescription>
          <DialogDescription className="lg:text-2xl xl:text-3xl">
            Genre: {genreNames(movie.genre_ids)}
          </DialogDescription>
          <DialogDescription className="lg:text-lg xl:text-xl">
            {movie.overview}
          </DialogDescription>
          <div className="flex gap-2">
            <Button size="lg">
              <Play className="lg:mr-2 lg:h-4 lg:w-4" /> Play
            </Button>
            <Button size="lg" variant="outline" onClick={() => toggle(movie.id)}>
              {inList ? (
                <>
                  <Check className="lg:mr-2 lg:h-4 lg:w-4" /> In My List
                </>
              ) : (
                <>
                  <Plus className="lg:mr-2 lg:h-4 lg:w-4" /> My List
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/MovieCard.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/MovieCard.tsx
git commit -m "feat: extract MovieCard with hover scale and My List toggle"
```

---

### Task 4: Generalize `EmblaCarousel` and add `MovieRow`

**Files:**
- Modify: `src/components/EmblaCarousel.tsx`
- Create: `src/components/MovieRow.tsx`

**Interfaces:**
- Consumes: `MovieCard` (Task 3), `Movie` (Task 1).
- Produces: `EmblaCarousel({ movies: Movie[] }): JSX.Element` (no longer reads the static JSON or renders a title), `MovieRow({ title: string; movies: Movie[] }): JSX.Element | null` — consumed by `index.tsx` (Task 6).

- [ ] **Step 1: Rewrite `EmblaCarousel` to take a `movies` prop and use `MovieCard`**

```tsx
// src/components/EmblaCarousel.tsx
import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { Movie } from "@/types/movie";

export const EmblaCarousel = ({ movies }: { movies: Movie[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container sm:gap-23 md:gap-17 lg:gap-34 xl:gap-42 2xl:gap-49">
          {movies.map((movie) => (
            <div className="embla__slide" key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
      <ChevronLeft className="embla__prev" onClick={scrollPrev} />
      {emblaApi?.canScrollNext() && (
        <ChevronRight className="embla__next" onClick={scrollNext} />
      )}
    </div>
  );
};
```

- [ ] **Step 2: Create `MovieRow`**

```tsx
// src/components/MovieRow.tsx
import { EmblaCarousel } from "@/components/EmblaCarousel";
import { Movie } from "@/types/movie";

export function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  if (movies.length === 0) return null;

  return (
    <div className="mb-8">
      <span className="text-xl font-netflix-sans font-semibold">{title}</span>
      <EmblaCarousel movies={movies} />
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/EmblaCarousel.tsx` or `src/components/MovieRow.tsx`. (Errors from `src/pages/index.tsx` still calling the old `EmblaCarousel` signature are expected until Task 6 — note them but don't fix yet.)

- [ ] **Step 4: Commit**

```bash
git add src/components/EmblaCarousel.tsx src/components/MovieRow.tsx
git commit -m "refactor: generalize EmblaCarousel to accept movies prop, add MovieRow"
```

---

### Task 5: Dynamic `HeroSection`

**Files:**
- Modify: `src/components/HeroSection.tsx`

**Interfaces:**
- Consumes: `Movie` (Task 1).
- Produces: `HeroSection({ movie: Movie | null }): JSX.Element | null` — consumed by `index.tsx` (Task 6).

- [ ] **Step 1: Rewrite `HeroSection` to take a `movie` prop**

```tsx
// src/components/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { Movie } from "@/types/movie";

export function HeroSection({ movie }: { movie: Movie | null }) {
  if (!movie) return null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover object-center"
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 flex items-center h-full px-4 md:px-8 lg:px-16 xl:px-20">
        <div className="max-w-lg lg:max-w-xl xl:max-w-2xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            {movie.title}
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-gray-200 mb-6 lg:mb-8 leading-relaxed max-w-md lg:max-w-lg">
            {movie.overview}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base"
            >
              <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2 fill-current" />
              Play
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-400 text-white hover:bg-gray-800/50 font-semibold px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base"
            >
              <Info className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              More Info
            </Button>
          </div>

          <div className="mt-6 lg:mt-8 hidden md:block">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>{year}</span>
              <span>&#9733; {movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/HeroSection.tsx`. (`index.tsx` still passing no `movie` prop is expected until Task 6.)

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat: make HeroSection render a dynamic movie prop"
```

---

### Task 6: Wire `index.tsx` with live TMDB data

**Files:**
- Modify: `src/pages/index.tsx`

**Interfaces:**
- Consumes: `fetchMovies`, `ROWS` (Task 1), `MovieRow` (Task 4), `HeroSection` (Task 5).

- [ ] **Step 1: Rewrite `index.tsx`**

```tsx
// src/pages/index.tsx
import { GetServerSideProps } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { MovieRow } from "@/components/MovieRow";
import { fetchMovies, ROWS } from "@/lib/tmdb";
import { Movie } from "@/types/movie";

interface Row {
  title: string;
  movies: Movie[];
}

interface HomeProps {
  rows: Row[];
  heroMovie: Movie | null;
}

export default function App({ rows, heroMovie }: HomeProps) {
  return (
    <div className="bg-[#141414] text-white font-netflix-sans dark">
      <Header />
      <HeroSection movie={heroMovie} />
      <div className="px-4 md:px-8 lg:px-16 xl:px-20 mt-4">
        {rows.map((row) => (
          <MovieRow key={row.title} title={row.title} movies={row.movies} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const rows = await Promise.all(
    ROWS.map(async (row): Promise<Row> => {
      try {
        const movies = await fetchMovies(row.endpoint);
        return {
          title: row.title,
          movies: row.limit ? movies.slice(0, row.limit) : movies,
        };
      } catch (err) {
        console.error(`Failed to load row "${row.title}":`, err);
        return { title: row.title, movies: [] };
      }
    })
  );

  const heroMovie = rows[0]?.movies[0] ?? null;

  return { props: { rows, heroMovie } };
};
```

- [ ] **Step 2: Run the dev server and verify manually**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: hero section shows a real trending movie (image, title, overview); 7 rows render with real TMDB posters; clicking a poster opens the dialog with title/date/vote/genre names/overview and a working "My List" toggle button that flips between "My List" and "In My List".

- [ ] **Step 3: Verify TypeScript compiles clean end-to-end**

Run: `npx tsc --noEmit`
Expected: no errors anywhere in `src/`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.tsx
git commit -m "feat: wire home page to live TMDB data via getServerSideProps"
```

---

### Task 7: Header nav label and "My List" link

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Rename "Recently Added" to "New & Popular" and link "My List" to `/my-list`**

Change the desktop nav (around the existing `<nav className="hidden lg:flex ...">` block):

```tsx
<nav className="hidden lg:flex space-x-2 items-center text-[#E5E5E5]">
  <Button variant="ghost" className="font-bold text-white">
    Home
  </Button>
  <Button variant="ghost">TV Shows</Button>
  <Button variant="ghost">Movies</Button>
  <Button variant="ghost">New &amp; Popular</Button>
  <Button variant="ghost" asChild>
    <Link href="/my-list">My List</Link>
  </Button>
</nav>
```

Change the mobile dropdown items:

```tsx
<DropdownMenuItem className="font-bold">Home</DropdownMenuItem>
<DropdownMenuItem>TV Shows</DropdownMenuItem>
<DropdownMenuItem>Movies</DropdownMenuItem>
<DropdownMenuItem>New &amp; Popular</DropdownMenuItem>
<DropdownMenuItem asChild>
  <Link href="/my-list">My List</Link>
</DropdownMenuItem>
```

Add the import at the top of the file:

```tsx
import Link from "next/link";
```

- [ ] **Step 2: Run the dev server and verify manually**

Run: `npm run dev` (if not already running), open `http://localhost:3000`.
Expected: nav shows "New & Popular" (desktop and the mobile dropdown at narrow width); clicking "My List" navigates to `/my-list` (will 404 until Task 8 — that's expected right now).

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: rename nav label to New & Popular, link My List to /my-list"
```

---

### Task 8: `/my-list` page

**Files:**
- Create: `src/pages/my-list.tsx`

**Interfaces:**
- Consumes: `useMyList` (Task 2), `MovieCard` (Task 3), `Movie` (Task 1).

- [ ] **Step 1: Implement the page**

Fetches directly against TMDB from the browser using the public key, since the list of ids is only known client-side (`localStorage`) — no backend route is introduced, consistent with the frontend-only constraint.

```tsx
// src/pages/my-list.tsx
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { useMyList } from "@/hooks/useMyList";
import { Movie } from "@/types/movie";

async function fetchMovieClient(id: number): Promise<Movie> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
  );
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default function MyListPage() {
  const { ids } = useMyList();
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setMovies([]);
      return;
    }
    let cancelled = false;
    Promise.all(ids.map(fetchMovieClient)).then((results) => {
      if (!cancelled) setMovies(results);
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="bg-[#141414] text-white font-netflix-sans dark min-h-screen">
      <Header />
      <div className="px-4 md:px-8 lg:px-16 xl:px-20 pt-24 pb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">My List</h1>
        {movies.length === 0 ? (
          <p className="text-gray-400">
            Your list is empty. Add movies from the home page.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Run the dev server and verify manually**

Run: `npm run dev` (if not already running).
1. On `/`, open a movie's dialog and click "My List" to add it.
2. Navigate to `/my-list`.
Expected: the added movie appears as a card; opening its dialog shows "In My List"; toggling it off there and reloading `/my-list` shows the empty-state message.

- [ ] **Step 3: Verify TypeScript compiles clean end-to-end**

Run: `npx tsc --noEmit`
Expected: no errors anywhere in `src/`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/my-list.tsx
git commit -m "feat: add /my-list page fetching favorited movies client-side"
```

---

### Task 9: Carousel arrow and sizing polish

Resolves the pre-existing TODOs in `index.tsx` about arrow design and
slide sizing. The "place 1 carousel over hero image" TODO is explicitly
descoped — it isn't part of the video checklist and overlapping a row on
top of the hero would hurt readability of the hero's title/buttons.

**Files:**
- Modify: `src/components/EmblaCarousel.tsx`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Fix slide sizing so cards use their own responsive width instead of a fixed 8.5% flex-basis**

In `src/styles/globals.css`, change:

```css
.embla__slide {
  flex: 0 0 8.5%;
  min-width: 0;
}
```

to:

```css
.embla__slide {
  flex: 0 0 auto;
  min-width: 0;
}
```

- [ ] **Step 2: Style and position the arrows in `EmblaCarousel`**

Replace the closing markup of the component (the two `Chevron*` lines) with absolutely-positioned circular buttons, and wrap the viewport in a `relative` container:

```tsx
  return (
    <div className="embla relative">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container sm:gap-23 md:gap-17 lg:gap-34 xl:gap-42 2xl:gap-49">
          {movies.map((movie) => (
            <div className="embla__slide" key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
      {emblaApi?.canScrollPrev() && (
        <button
          onClick={scrollPrev}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-10 bg-black/40 hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}
      {emblaApi?.canScrollNext() && (
        <button
          onClick={scrollNext}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-10 bg-black/40 hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Run the dev server and verify manually**

Run: `npm run dev` (if not already running).
Expected: left arrow is hidden at the start of a row and appears after scrolling right; right arrow hides at the end of a row; both arrows are circular, semi-transparent, full-height overlays that darken on hover; card widths now match the responsive sizing set in `MovieCard` instead of being squeezed to a fixed percentage.

- [ ] **Step 4: Commit**

```bash
git add src/components/EmblaCarousel.tsx src/styles/globals.css
git commit -m "style: position/hide carousel arrows properly, fix slide sizing"
```

---

### Task 10: Remove the now-unused static fixture

**Files:**
- Delete: `api-response-example.json`

- [ ] **Step 1: Confirm nothing still imports it**

Run: `grep -rn "api-response-example" src/`
Expected: no matches (Task 4 already removed the only import in `EmblaCarousel.tsx`).

- [ ] **Step 2: Delete the file**

```bash
git rm api-response-example.json
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove static movie fixture now that home page uses live TMDB data"
```
