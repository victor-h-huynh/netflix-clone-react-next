import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import nowPlayingMovies from "../../api-response-example.json";

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
            // NOTE: ADD DIALOG HERE TO DISPLAY EACH ONE
            <div className="embla__slide " key={index}>
              <div className="sm:w-[22vw] lg:w-55 xl:w-68 2xl:w-80">
                <img
                  className="rounded-sm sm:h-[25vh] lg:h-100 xl:h-140 2xl:h-180"
                  src={
                    `https://image.tmdb.org/t/p/original` + movie.poster_path
                  }
                  alt=""
                />
              </div>
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
