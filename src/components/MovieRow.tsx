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
