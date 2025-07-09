import nowPlayingMovies from "../../api-response-example.json";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// TODO: NETFLIX TEXT

export default function App() {
  console.log("nowPlayingMovies", nowPlayingMovies);

  return (
    <div className="bg-[#141414] text-white font-netflix-sans">
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
  return (
    <>
      <div className="flex justify-between px-[60px] py-[25px]">
        <div className="flex w-[570px] h-[30px] ml-10 space-x-6 lg:mr-60">
          <img src="/images/netflix-logo.png" alt="" />
          <ul className="font-bold">Home</ul>
          <ul>TV Shows</ul>
          <ul>Movies</ul>
          <ul>Recently Added</ul>
          <ul>My List</ul>
        </div>
        <div className="flex space-x-6 mr-15">
          <ul>Search Icon</ul>
          <ul>Notification</ul>
          <ul>Profile Image</ul>
        </div>
      </div>
    </>
  );
}

function Footer() {
  return (
    <div className="grid grid-cols-4 gap-4 ml-25">
      <ul>1</ul>
      <ul>2</ul>
      <ul>3</ul>
      <ul>4</ul>
      <ul>5</ul>
      <ul>6</ul>
      <ul>7</ul>
      <ul>8</ul>
      <ul>9</ul>
      <ul>10</ul>
      <ul>11</ul>
      <ul>12</ul>
      <ul>13</ul>
    </div>
  );
}

function HeroSection() {
  // NOTE: One movie hero portrait. Play around with image
  // To make like hero shot.
  // mask Y tailwind bottom left bottom right
  // text layer ontop of it.
  // Find a solution AI, tailwind for overlapping text on a image
  // NOTE: used prompt Teach me as a junior dev How to move elements over an image tailwind and css ways
  return (
    <div className="relative">
      <img
        className="w-full h-full"
        src="/images/the-office-poster.jpg"
        alt="the office poster"
      />
      <div className="flex flex-col justify-between w-1/4 ml-[50px] absolute -translate-y-[500px]">
        <span>
          A mockumentary on a group of typical office workers, where the workday
          consists of ego clashes, inappropriate behavior, tedium and romance
        </span>
        <div className="space-x-2">
          <Button>Play</Button>
          <Button variant="outline">Watch Trailer</Button>
        </div>
      </div>
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
