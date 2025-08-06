import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import nowPlayingMovies from "../../api-response-example.json";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const EmblaCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const movies = [...nowPlayingMovies.results];

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const showRightButton = emblaApi?.canScrollNext();
  console.log("TEST", emblaApi?.canScrollNext());

  return (
    <div className="embla ">
      <span className=" text-xl  font-netflix-sans font-semibold">
        New this week
      </span>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container sm:gap-23 md:gap-17 lg:gap-34 xl:gap-42 2xl:gap-49">
          {movies.map((movie, index) => (
            <div className="embla__slide " key={index}>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="sm:w-[22vw] lg:w-55 xl:w-68 2xl:w-80">
                    <img
                      className="rounded-sm sm:h-[25vh] lg:h-100 xl:h-140 2xl:h-180"
                      src={
                        `https://image.tmdb.org/t/p/original` +
                        movie.poster_path
                      }
                      alt={movie.title}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="lg:!max-w-[90vw] lg:flex lg:flex-row lg:p-0">
                  <img
                    className="lg:h-auto lg:max-h-[35vh] xl:max-h-[46vh]"
                    src={
                      `https://image.tmdb.org/t/p/original` + movie.poster_path
                    }
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
                      Genre: {movie.genre_ids}
                    </DialogDescription>
                    <DialogDescription className="lg:text-lg xl:text-xl">
                      {movie.overview}
                    </DialogDescription>
                    <div>
                      <Button size="lg">
                        <Play className="lg:mr-2 lg:h-4 lg:w-4" /> Play
                      </Button>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
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
