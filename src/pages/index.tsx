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
import {
  Bell,
  Gift,
  Search,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
} from "lucide-react";
import Link from "next/link";

// TODO: NETFLIX TEXT
// TODO: UPDATE THEME FILE, REMOVE HARD CODE COLOUR VALUES
// TODO: FIX SPACING VOTE COUNT Victor
// TODO: CODE SPLITTING
// TODO: HEADER RESPONSIVENESS, CHECK ISSUE OF SMALL SCREEN SIZES
// TODO: HEADER TEXT COLOUR Victor
// TODO: IMPLEMENT HERO SECTION AND
// TODO: CAROUSEL COMPONENT AS DESIGNED, PROPER ARROW DESIGN, WIDER THUMBNAILS, LEFT HIDDEN AT START, CAROUSEL COMPONENT CHEVERON, Victor

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
    <div className="flex items-center justify-center w-full text-[#808080]">
      <div className="flex-col flex-start sm:w-130 md:w-150 lg:w-200 xl:w-200">
        <div className="flex gap-x-3 ">
          <Instagram className="hover:text-gray-300" size={33} />
          <Twitter className="hover:text-gray-300" size={33} />
          <Facebook className="hover:text-gray-300" size={33} />
          <Youtube className="hover:text-gray-300" size={33} />
        </div>
        <div className="flex-col flex-wrap my-5 font-medium">
          <div className="flex my-2">
            <Link
              className="hover:text-gray-300 flex-1"
              href="https://www.google.ca"
            >
              FAQ
            </Link>

            <Link
              className="hover:text-gray-300 flex-1"
              href="https://www.google.ca"
            >
              Help Center
            </Link>
            <Link
              className="hover:text-gray-300 flex-1"
              href="https://www.google.ca"
            >
              Account
            </Link>
          </div>
          <div className="flex my-2">
            <Link
              className="hover:text-gray-300 flex-1"
              href="https://www.google.ca"
            >
              Terms of Use
            </Link>
            <Link
              className="hover:text-gray-300 flex-1"
              href="https://www.google.ca"
            >
              Privacy
            </Link>
            <Link
              className="hover:text-gray-300 flex-1"
              href="https://www.google.ca"
            >
              Contact Us
            </Link>
          </div>
          <Link
            className="hover:text-gray-300 flex-1"
            href="https://www.google.ca"
          >
            Legal Notices
          </Link>
        </div>
        <div>
          <Button className="border-1 rounded-none bg-red-500/0 text-[#808080] border-[#808080] shadow-xs hover:bg-accent hover:text-accent-foreground">
            Button
          </Button>
        </div>
        <div className="mt-5">
          <span>© 1997-2021 Netflix, Inc. i-062d573a0ee099242</span>
        </div>
      </div>
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
