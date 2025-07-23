import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Gift, Search, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="relative">
      {/* Main Header */}
      <div className="flex justify-between items-center px-4 md:px-8 lg:px-[60px] py-4 md:py-[25px]">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center">
          {/* Logo */}
          <img
            className="h-6 md:h-8 mr-4 md:mr-10"
            src="/images/netflix-logo.png"
            alt="Netflix"
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-2 items-center text-[#E5E5E5]">
            <Button variant="ghost" className="font-bold text-white">
              Home
            </Button>
            <Button variant="ghost">TV Shows</Button>
            <Button variant="ghost">Movies</Button>
            <Button variant="ghost">Recently Added</Button>
            <Button variant="ghost">My List</Button>
          </nav>
        </div>

        {/* Right Section - Actions and Profile */}
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* Search - Hidden on mobile, show on medium screens and up */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-[#E5E5E5] p-2"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications - Hidden on small screens */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-[#E5E5E5] p-2"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Gift - Hidden on small screens */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-[#E5E5E5] p-2"
          >
            <Gift className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Dropdown - Show on smaller screens */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-bold">Home</DropdownMenuItem>
              <DropdownMenuItem>TV Shows</DropdownMenuItem>
              <DropdownMenuItem>Movies</DropdownMenuItem>
              <DropdownMenuItem>Recently Added</DropdownMenuItem>
              <DropdownMenuItem>My List</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Search className="h-4 w-4 mr-2" />
                Search
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Gift className="h-4 w-4 mr-2" />
                Gifts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <img
                className="w-6 h-6 md:w-8 md:h-8 cursor-pointer rounded-full"
                src="https://avatar.iran.liara.run/public"
                alt="Profile"
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
    </header>
  );
}
