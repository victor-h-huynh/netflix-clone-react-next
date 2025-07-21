import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Gift, Search } from "lucide-react";

export function Header() {
  return (
    <>
      <div className="flex justify-between px-[60px] py-[25px]">
        <div className="flex space-x-2 items-center text-[#E5E5E5]">
          <img className="mr-10" src="/images/netflix-logo.png" alt="" />
          <Button variant="ghost" className="font-bold text-white">
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
