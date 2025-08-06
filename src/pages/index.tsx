import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { EmblaCarousel } from "@/components/EmblaCarousel";

// TODO: CAROUSEL COMPONENT AS DESIGNED, PROPER ARROW DESIGN, WIDER THUMBNAILS, LEFT HIDDEN AT START,
// NOTE: HIDING PREV BTN NEEDS EXTRA WORK W/ APPLYING CSS CLAVASCRIPT ETC.SSES JA
// TODO: CAROUSEL PERSERVE SIZING, QUALITY FOR IMAGE AND RESPONSIVE
// TODO: ATTACH API CALL
// TODO: CONVERT ID TO ACTUAL NAME OF GENRE
// TODO: LOGIN SCREEN
// TODO: PLACE 1 CAROUSEL OVER HERO IMAGE
export default function App() {
  return (
    <div className="bg-[#141414] text-white font-netflix-sans dark">
      <Header />
      <HeroSection />
      <EmblaCarousel />
      <Footer />
    </div>
  );
}
