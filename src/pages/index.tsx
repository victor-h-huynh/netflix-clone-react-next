import nowPlayingMovies from "../../api-response-example.json";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function App() {
  console.log("nowPlayingMovies", nowPlayingMovies);

  return (
    <div>
      <Header />
      <HeroSection />
      <MovieCardCarousel />
      <MovieCardCarousel />
      <MovieCardCarousel />
      <Footer />
    </div>
  );
}

function Header() {
  return <h1>Header</h1>;
}

function Footer() {
  return <h1>Footer</h1>;
}

function HeroSection() {
  // NOTE: One movie hero portrait. Play around with image
  // To make like hero shot.
  // mask Y tailwind bottom left bottom right
  // hero shot max width max height
  // text layer ontop of it.
  // Find a solution AI, tailwind for overlapping text on a image
  // React
  return (
    <div>
      <Button>Play</Button>
      <Button variant="outline">Watch Trailer</Button>
    </div>
  );
}

function MovieCardCarousel() {
  const movies = [...nowPlayingMovies.results];
  return (
    <div className="w-[90%] m-auto">
      <span>New this week</span>
      <Carousel>
        <CarouselContent className="p-8 m-8">
          {movies.map((movie, index) => (
            // NOTE: Asked AI for website layout in React to know how I should
            // be creating each function.

            // NOTE: Where should the key.id go?
            <CarouselItem className="basis-1/7">
              <div className="">
                <img
                  src={
                    `https://image.tmdb.org/t/p/original` + movie.poster_path
                  }
                  alt=""
                />
              </div>
              <div>
                <h1 key={movie.id}>Title: {movie.title}</h1>
                <span>Rating: {movie.vote_average}</span>
                <span>Vote Count: {movie.vote_count}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
