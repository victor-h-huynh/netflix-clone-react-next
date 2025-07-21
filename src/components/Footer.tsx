import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

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
      </div>
    </div>
  );
}
