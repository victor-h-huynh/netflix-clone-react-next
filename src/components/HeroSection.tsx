import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover object-center"
          src="/images/the-office-poster.jpg"
          alt="The Office"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center h-full px-4 md:px-8 lg:px-16 xl:px-20">
        <div className="max-w-lg lg:max-w-xl xl:max-w-2xl">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            The Office
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base lg:text-lg text-gray-200 mb-6 lg:mb-8 leading-relaxed max-w-md lg:max-w-lg">
            A mockumentary on a group of typical office workers, where the
            workday consists of ego clashes, inappropriate behavior, tedium and
            romance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base"
            >
              <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2 fill-current" />
              Play
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-400 text-white hover:bg-gray-800/50 font-semibold px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base"
            >
              <Info className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              More Info
            </Button>
          </div>

          <div className="mt-6 lg:mt-8 hidden md:block">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="bg-gray-600 px-2 py-1 rounded text-xs">
                TV-14
              </span>
              <span>2005</span>
              <span>9 Seasons</span>
              <span className="border border-gray-400 px-2 py-1 rounded text-xs">
                HD
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
}
