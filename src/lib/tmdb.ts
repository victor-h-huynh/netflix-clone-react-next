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
