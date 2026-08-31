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
  const data = await res.json();
  return {
    ...data,
    genre_ids: (data.genres ?? []).map((g: { id: number }) => g.id),
  };
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
    Promise.allSettled(ids.map(fetchMovieClient)).then((results) => {
      if (cancelled) return;
      const fulfilled = results
        .filter(
          (r): r is PromiseFulfilledResult<Movie> => r.status === "fulfilled"
        )
        .map((r) => r.value);
      setMovies(fulfilled);
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
        {ids.length === 0 ? (
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
