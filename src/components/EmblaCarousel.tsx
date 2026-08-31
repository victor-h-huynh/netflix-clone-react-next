import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { Movie } from "@/types/movie";

export const EmblaCarousel = ({ movies }: { movies: Movie[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi]);

  return (
    <div className="embla relative">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container sm:gap-23 md:gap-17 lg:gap-34 xl:gap-42 2xl:gap-49">
          {movies.map((movie) => (
            <div className="embla__slide" key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
      {canPrev && (
        <button
          onClick={scrollPrev}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-10 bg-black/40 hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}
      {canNext && (
        <button
          onClick={scrollNext}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-10 bg-black/40 hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}
    </div>
  );
};
