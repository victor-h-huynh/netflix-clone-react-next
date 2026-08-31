import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { Movie } from "@/types/movie";

const PLACEHOLDER_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";

export function HeroSection({ movie }: { movie: Movie | null }) {
  if (!movie) return null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
  const backdropSrc = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : PLACEHOLDER_IMAGE;

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover object-center"
          src={backdropSrc}
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
