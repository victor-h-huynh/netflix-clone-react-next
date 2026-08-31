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
        <div className="sm:w-[22vw] lg:w-55 xl:w-68 2xl:w-80 transition-transform duration-200 hover:scale-105 cursor-pointer">
          <img
            className="rounded-sm sm:h-[25vh] lg:h-100 xl:h-140 2xl:h-180 object-cover w-full"
            src={posterSrc}
            alt={movie.title}
          />
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
