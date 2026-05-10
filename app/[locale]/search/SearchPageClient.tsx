
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LandingSearchBar from "@/components/search/LandingSearchBar";
import Container from "@/components/ui/Container";
import { fetchCentersSearchClient } from "@/lib/centersPublicApi";
import type { CenterDetailData } from "@/lib/apiEndpoints";
import { MapPin, Star, Navigation, Clock, ChevronRight } from "lucide-react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop";

// Extended service type (matching typical Fresha API response)
interface ServiceItem {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  currency?: string;
}

// Enhanced CenterDetailData to include services if available
interface ExtendedCenterData extends CenterDetailData {
  distance_km?: number;
  services?: ServiceItem[];
}

// Helper: format duration from minutes to "X hr" or "X hr, Y min"
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr, ${mins} min`;
}

// Helper: generate sample services for design consistency when real data missing
function getSampleServices(centerName: string, categoryName?: string): ServiceItem[] {
  const isNails = centerName.toLowerCase().includes("nail") || categoryName?.toLowerCase().includes("nail");
  const isSkin = centerName.toLowerCase().includes("bio") || categoryName?.toLowerCase().includes("cosmetic");
  
  if (isNails) {
    return [
      { id: 1, name: "Manichiura cu Oja-semi", duration_minutes: 60, price: 110, currency: "RON" },
      { id: 2, name: "Constructie gel scurt", duration_minutes: 80, price: 150, currency: "RON" },
      { id: 3, name: "Pedichiura cu oja-semi", duration_minutes: 60, price: 120, currency: "RON" },
    ];
  }
  if (isSkin) {
    return [
      { id: 1, name: "Paraffinos kéz ápolás", duration_minutes: 30, price: 110, currency: "RON" },
      { id: 2, name: "Arcterapie faciala", duration_minutes: 60, price: 180, currency: "RON" },
    ];
  }
  return [
    { id: 1, name: "Tratament facial de baza", duration_minutes: 50, price: 100, currency: "RON" },
    { id: 2, name: "Masaj de relaxare", duration_minutes: 60, price: 130, currency: "RON" },
    { id: 3, name: "Epilare ceara", duration_minutes: 30, price: 70, currency: "RON" },
  ];
}

// Single Venue Card Component - matches Fresha style
function VenueCard({ center }: { center: ExtendedCenterData }) {
  const gc = center.global_categories?.[0];
  const categoryName = gc?.name ?? "Beauty Service";
  const services = center.services?.length 
    ? center.services.slice(0, 3) 
    : getSampleServices(center.name, categoryName);
  const distance = center.distance_km ? `${center.distance_km} km` : ">30 mi";
  const locationText = center.domain || "Local Area";
  const imageUrl = (center.primary_images?.length ? center.primary_images[0] : center.logo) || FALLBACK_IMG;
  const rating = 4.8; // placeholder, could come from center.review_aggregate
  const reviewCount = 120;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md border border-gray-100">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={center.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
          <MapPin className="h-3 w-3 text-[#225D5C]" />
          <span>{distance}</span>
        </div>
      </div>

      <div className="flex flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{center.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Navigation className="h-3 w-3" />
              <span className="line-clamp-1">{locationText}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-[#225D5C] text-[#225D5C]" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
        </div>

        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{service.name}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(service.duration_minutes)}
                </span>
              </div>
              <span className="font-semibold text-[#225D5C]">
                {service.currency || "RON"} {service.price}
              </span>
            </div>
          ))}
        </div>

        <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          View {services.length} matching services
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Map Sidebar Component - static map area matching Fresha style
function MapSidebar({ venuesCount, locationsList }: { venuesCount: number; locationsList: string[] }) {
  // Distinct location names from image example
  const popularSpots = locationsList.length ? locationsList.slice(0, 6) : [
    "Cluj-Napoca", "Turda", "Alba Iulia", "Sibiu", "Brașov", "Sfântu Gheorghe"
  ];
  
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden sticky top-28">
      {/* Map placeholder with pins */}
      <div className="relative h-64 w-full bg-gradient-to-br from-[#E8F3F1] to-[#D4E8E5]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full">
            {/* Decorative map grid lines */}
            <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-full border-2 border-dashed border-[#225D5C]/20" />
            <div className="absolute right-[15%] bottom-[25%] h-24 w-24 rounded-full border-2 border-dashed border-[#225D5C]/20" />
            
            {/* Mock pins */}
            <div className="absolute left-[20%] top-[30%] flex flex-col items-center">
              <div className="h-6 w-6 rounded-full bg-[#225D5C] shadow-lg ring-4 ring-white/80" />
              <span className="mt-1 text-xs font-medium text-gray-700">Cluj</span>
            </div>
            <div className="absolute left-[55%] top-[15%] flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-[#D97706] shadow-lg ring-4 ring-white/80" />
              <span className="mt-1 text-xs font-medium text-gray-700">Turda</span>
            </div>
            <div className="absolute right-[25%] top-[55%] flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-[#225D5C] shadow-lg ring-4 ring-white/80" />
              <span className="mt-1 text-xs font-medium text-gray-700">Sibiu</span>
            </div>
            <div className="absolute left-[40%] bottom-[20%] flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-[#225D5C] shadow-lg ring-4 ring-white/80" />
              <span className="mt-1 text-xs font-medium text-gray-700">Brașov</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
          {venuesCount} venues within map area
        </div>
      </div>
      
      {/* Location chips row */}
      <div className="p-4 border-t border-gray-100">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Popular locations</h4>
        <div className="flex flex-wrap gap-2">
          {popularSpots.map((loc) => (
            <button
              key={loc}
              className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
            >
              {loc}
            </button>
          ))}
        </div>
        
        {/* Ratings quick filter row - matching Fresha style */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Rating</span>
            {[5,4,3,2,1].map((star) => (
              <button key={star} className="flex items-center gap-0.5 text-xs hover:text-[#225D5C]">
                <Star className="h-3 w-3 fill-current" />
                <span>{star}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>RON 110</span>
            <span className="mx-0.5">|</span>
            <span>50</span>
            <span className="mx-0.5">|</span>
            <span>100</span>
            <span className="mx-0.5">|</span>
            <span>130</span>
            <span className="mx-0.5">|</span>
            <span>150</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to extract location names from centers (could be domain or city)
function extractLocationsFromCenters(centers: ExtendedCenterData[]): string[] {
  const locations = centers.map(c => c.domain?.split(',')[0]?.trim()).filter(Boolean);
  return [...new Set(locations)] as string[];
}

export default function SearchPageClient() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const slug = searchParams.get("global_category_slug");
  const id = searchParams.get("global_category_id");
  const date = searchParams.get("date");
  const timePreset = searchParams.get("time_preset") as "morning" | "afternoon" | "evening" | null;

  const [centers, setCenters] = useState<ExtendedCenterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"venues" | "professionals">("venues");

  const queryArgs = useMemo(() => {
    const p: { global_category_slug?: string; global_category_id?: string } = {};
    if (slug) p.global_category_slug = slug;
    else if (id) p.global_category_id = id;
    return p;
  }, [slug, id]);

  useEffect(() => {
    let cancelled = false;
    void fetchCentersSearchClient(queryArgs).then((data) => {
      if (cancelled) return;
      setCenters(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [queryArgs]);

  const locationNames = useMemo(() => extractLocationsFromCenters(centers), [centers]);

  return (
    <div className="min-h-screen bg-[#FBF9F8] pb-16">
      {/* Sticky header with fresha style tabs and search bar */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <Container>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <span className="text-2xl font-semibold tracking-tight text-[#1F2A2A]">fresha</span>
              <div className="hidden items-center gap-1 rounded-full bg-gray-100 p-1 sm:flex">
                <button
                  onClick={() => setActiveTab("venues")}
                  className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
                    activeTab === "venues" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Venues
                </button>
                <button
                  onClick={() => setActiveTab("professionals")}
                  className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
                    activeTab === "professionals" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Professionals
                </button>
              </div>
              <div className="hidden text-sm font-medium text-gray-500 lg:block">
                {!loading && `${centers.length} venues within map area`}
              </div>
            </div>
            <div className="flex-1 md:max-w-md">
              <LandingSearchBar
                variant="header"
                initialCategorySlug={slug}
                initialCategoryId={id}
                initialDate={date}
                initialTimePreset={timePreset ? timePreset as "any" | "morning" | "afternoon" | "evening" : null}
              />
            </div>
          </div>
        </Container>
      </header>

      <Container className="pt-6 lg:pt-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left column - Map sidebar (sticky) */}
          <aside className="w-full lg:w-1/3 xl:w-1/4">
            {!loading && (
              <MapSidebar venuesCount={centers.length} locationsList={locationNames} />
            )}
          </aside>

          {/* Right column - Results grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
              </div>
            ) : centers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700">No venues found</p>
                <p className="mt-1 text-sm text-gray-400">Try adjusting your search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
                {centers.map((center) => (
                  <VenueCard key={center.id} center={center} />
                ))}
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
