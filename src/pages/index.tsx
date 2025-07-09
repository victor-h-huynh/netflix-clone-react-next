import nowPlayingMovies from "../../api-response-example.json";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Gift, Search } from "lucide-react";

// TODO: NETFLIX TEXT

export default function App() {
  console.log("nowPlayingMovies", nowPlayingMovies);

  return (
    <div className="bg-[#141414] text-white font-netflix-sans dark">
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
        <div className="flex space-x-2 items-center">
          <img className="mr-10" src="/images/netflix-logo.png" alt="" />
          <Button variant="ghost" className="font-bold">
            Home
          </Button>
          <Button variant="ghost">TV Shows</Button>
          <Button variant="ghost">Movies</Button>
          <Button variant="ghost">Recently Added</Button>
          <Button variant="ghost">My List</Button>
        </div>
        <div className="flex space-x-6 items-center">
          <Search />
          <Bell />
          <Gift />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <img
                className="w-8 h-8 cursor-pointer rounded-full"
                src="https://avatar.iran.liara.run/public"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <CarouselItem key={index} className="basis-1/7">
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
