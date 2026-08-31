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
