import { Button } from "@/components/ui/button";

export function HeroSection() {
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
