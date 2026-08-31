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

const PLACEHOLDER_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";

export function MovieCard({ movie }: { movie: Movie }) {
  const { isInList, toggle } = useMyList();
  const inList = isInList(movie.id);
  const posterSrc = movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : PLACEHOLDER_IMAGE;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative w-[38vw] sm:w-[22vw] md:w-[17vw] lg:w-[13vw] xl:w-[10vw] 2xl:w-[9vw] transition-transform duration-200 hover:scale-105 cursor-pointer">
          <img
            className="rounded-sm aspect-[2/3] object-cover w-full"
            src={posterSrc}
            alt={movie.title}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-b-sm bg-gradient-to-t from-black/90 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-white text-xs sm:text-sm font-medium truncate">
              {movie.title}
            </p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="lg:!max-w-[90vw] lg:flex lg:flex-row lg:p-0">
        <img
          className="lg:h-auto lg:max-h-[35vh] xl:max-h-[46vh]"
          src={posterSrc}
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
