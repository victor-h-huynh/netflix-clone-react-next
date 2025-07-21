import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { EmblaCarousel } from "@/components/EmblaCarousel";

// TODO: UPDATE THEME FILE, REMOVE HARD CODE COLOUR VALUES
// TODO: IMPLEMENT HERO SECTION
// TODO: CAROUSEL COMPONENT AS DESIGNED, PROPER ARROW DESIGN, WIDER THUMBNAILS, LEFT HIDDEN AT START, CAROUSEL COMPONENT CHEVERON, Victor
// NOTE: HIDING PREV BTN NEEDS EXTRA WORK W/ APPLYING CSS CLAVASCRIPT ETC.SSES JA
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
