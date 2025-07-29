import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Youtube, Instagram, Play } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Footer() {
  return (
    <div className="flex items-center justify-center w-full text-[#808080]">
      <div className="flex-col flex-start sm:w-130 md:w-150 lg:w-200 xl:w-200">
        <div className="flex gap-x-3 ">
          <Instagram className="hover:text-gray-300" size={33} />
          <Twitter className="hover:text-gray-300" size={33} />
          <Facebook className="hover:text-gray-300" size={33} />
          <Youtube className="hover:text-gray-300" size={33} />
        </div>
        <div className="flex-col text-sm w-[100vw] sm:w-auto flex-wrap my-5 font-medium text-nowrap text-left">
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
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="lg:!max-w-[90vw] lg:flex lg:flex-col lg:p-0">
          <img
            className="lg:w-full lg:h-auto lg:max-h-[30vh] lg:object-cover"
            src="https://image.tmdb.org/t/p/original/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg"
            alt="28 Days Later Movie Poster"
          />
          <DialogHeader className="lg:flex-1 lg:p-6 lg:overflow-y-auto text-left">
            <DialogTitle>28 Days Later</DialogTitle>
            <DialogDescription>
              2002-10-31 <span>&#8226;</span> 7.2/10 (7403 votes)
            </DialogDescription>
            <DialogDescription>
              Horror, Thriller, Science Fiction
            </DialogDescription>
            <DialogDescription>
              Twenty-eight days after a killer virus was accidentally unleashed
              from a British research facility, a small group of London
              survivors are caught in a desperate struggle to protect themselves
              from the infected. Carried by animals and humans, the virus turns
              those it infects into homicidal maniacs -- and it's absolutely
              impossible to contain.
            </DialogDescription>
          </DialogHeader>
          <div className="lg:p-6 lg:pt-0">
            <Button>
              <Play className="lg:mr-2 lg:h-4 lg:w-4" /> Play
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
