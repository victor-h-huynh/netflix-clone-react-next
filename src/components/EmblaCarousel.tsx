import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { Movie } from "@/types/movie";

export const EmblaCarousel = ({ movies }: { movies: Movie[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container sm:gap-23 md:gap-17 lg:gap-34 xl:gap-42 2xl:gap-49">
          {movies.map((movie) => (
            <div className="embla__slide" key={movie.id}>
              <MovieCard movie={movie} />
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
