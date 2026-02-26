import HeroSection from "@/features/landing/sections/HeroSection";
import RecommendedSection from "@/features/landing/sections/RecommendedSection";
import NewSection from "@/features/landing/sections/NewSection";
import TrendingSection from "@/features/landing/sections/TrendingSection";
import AppDownloadSection from "@/features/landing/sections/AppDownloadSection";
import ReviewsSection from "@/features/landing/sections/ReviewsSection";
import StatsSection from "@/features/landing/sections/StatsSection";
import BusinessSection from "@/features/landing/sections/BusinessSection";
import BrowseCitySection from "@/features/landing/sections/BrowseCitySection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <RecommendedSection />
      <NewSection />
      <TrendingSection />
      <AppDownloadSection />
      <ReviewsSection />
      <StatsSection />
      <BusinessSection />
      <BrowseCitySection />
    </>
  );
}
