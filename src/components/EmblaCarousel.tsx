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
    <div className="embla">
      <span className="text-xl font-netflix-sans font-semibold">
        New this week
      </span>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {movies.map((movie, index) => (
            <div className="embla__slide" key={index}>
              <div className=" sm:w-0 md:w-0 lg:w-70 xl:w-53 w-[1000px] ml-">
                <img
                  className=" rounded-sm sm:h-0 md:h-0 lg:h-63 xl:h-95 h-[1000px]"
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
