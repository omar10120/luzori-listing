"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Map as MapIcon, List as ListIcon } from "lucide-react";

import LandingSearchBar from "@/components/search/LandingSearchBar";
import Container from "@/components/ui/Container";
import SearchResultCard from "@/components/search/SearchResultCard";
import ProfessionalCard from "@/components/search/ProfessionalCard";
import { fetchCentersSearchClient } from "@/lib/centersPublicApi";
import type { CenterDetailData } from "@/lib/apiEndpoints";
import {
  buildProfessionalMarkers,
  buildProfessionals,
  buildVenueMarkers,
  venueKey,
  type Professional,
} from "@/lib/searchEntities";
import type { SearchMapMarker } from "@/components/search/SearchMap";
import { cn } from "@/lib/utils";

const SearchMap = dynamic(() => import("@/components/search/SearchMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
    </div>
  ),
});

type Tab = "venues" | "professionals";
type MobileView = "list" | "map";

export default function SearchPageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const slug = searchParams.get("global_category_slug");
  const id = searchParams.get("global_category_id");
  const date = searchParams.get("date");
  const timePreset = searchParams.get("time_preset") as
    | "morning"
    | "afternoon"
    | "evening"
    | null;

  const [centers, setCenters] = useState<CenterDetailData[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("venues");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; nonce: number } | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const queryArgs = useMemo(() => {
    const p: { global_category_slug?: string; global_category_id?: string } = {};
    if (slug) p.global_category_slug = slug;
    else if (id) p.global_category_id = id;
    return p;
  }, [slug, id]);

  const [lastArgs, setLastArgs] = useState(queryArgs);
  if (lastArgs !== queryArgs) {
    setLastArgs(queryArgs);
    setLoading(true);
  }

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

  const [lastTab, setLastTab] = useState(tab);
  if (lastTab !== tab) {
    setLastTab(tab);
    setActiveId(null);
    setHoveredId(null);
    setFocus(null);
  }

  const professionals = useMemo<Professional[]>(
    () => buildProfessionals(centers),
    [centers]
  );

  const venueMarkers = useMemo<SearchMapMarker[]>(
    () => buildVenueMarkers(centers),
    [centers]
  );
  const professionalMarkers = useMemo<SearchMapMarker[]>(
    () => buildProfessionalMarkers(professionals),
    [professionals]
  );

  const markers = tab === "venues" ? venueMarkers : professionalMarkers;
  const listCount = tab === "venues" ? centers.length : professionals.length;

  const handleSelect = useCallback((key: string) => {
    setActiveId(key);
    setFocus({ id: key, nonce: Date.now() });
  }, []);

  const handleMarkerClick = useCallback((key: string) => {
    setActiveId(key);
    const el = cardRefs.current.get(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const setCardRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(key, el);
      else cardRefs.current.delete(key);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-16">
      <header className="sticky top-16 z-30 border-b border-gray-100 bg-[#FFFDFC]/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-[#FFFDFC]/85">
        <Container>
          <LandingSearchBar
            variant="header"
            initialCategorySlug={slug}
            initialCategoryId={id}
            initialDate={date}
            initialTimePreset={
              timePreset
                ? (timePreset as "any" | "morning" | "afternoon" | "evening")
                : null
            }
          />
        </Container>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-3 pt-16 sm:px-4 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label={t("search_results_title")}
              className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-gray-200"
            >
              <TabButton
                active={tab === "venues"}
                onClick={() => setTab("venues")}
              >
                {t("tab_venues")}
              </TabButton>
              <TabButton
                active={tab === "professionals"}
                onClick={() => setTab("professionals")}
              >
                {t("tab_professionals")}
              </TabButton>
            </div>
            {!loading && (
              <span className="hidden text-sm text-gray-500 sm:inline">
                {t("search_summary", {
                  venues: listCount,
                  markers: markers.length,
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() =>
                setMobileView((v) => (v === "list" ? "map" : "list"))
              }
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              {mobileView === "list" ? (
                <>
                  <MapIcon size={16} /> {t("show_map")}
                </>
              ) : (
                <>
                  <ListIcon size={16} /> {t("show_list")}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:gap-6">
          <section
            className={cn("min-w-0", mobileView === "map" && "hidden lg:block")}
          >
            {loading ? (
              <LoadingState />
            ) : tab === "venues" ? (
              <VenuesList
                centers={centers}
                locale={locale}
                activeId={activeId}
                onHover={setHoveredId}
                onSelect={handleSelect}
                setCardRef={setCardRef}
                emptyLabel={t("search_no_results")}
              />
            ) : (
              <ProfessionalsList
                professionals={professionals}
                locale={locale}
                activeId={activeId}
                onHover={setHoveredId}
                onSelect={handleSelect}
                setCardRef={setCardRef}
                emptyLabel={t("search_no_professionals")}
              />
            )}
          </section>

          <aside
            className={cn("min-w-0", mobileView === "list" && "hidden lg:block")}
          >
            <div className="lg:sticky lg:top-44">
              <div className="h-[60vh] w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:h-[calc(100vh-12rem)]">
                <SearchMap
                  markers={markers}
                  hoveredId={hoveredId}
                  activeId={activeId}
                  focus={focus}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "text-gray-700 hover:text-gray-900"
      )}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-100">
      <p className="text-gray-500">{label}</p>
    </div>
  );
}

interface VenuesListProps {
  centers: CenterDetailData[];
  locale: string;
  activeId: string | null;
  onHover: (key: string | null) => void;
  onSelect: (key: string) => void;
  setCardRef: (key: string) => (el: HTMLDivElement | null) => void;
  emptyLabel: string;
}

function VenuesList({
  centers,
  locale,
  activeId,
  onHover,
  onSelect,
  setCardRef,
  emptyLabel,
}: VenuesListProps) {
  if (!centers.length) return <EmptyState label={emptyLabel} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {centers.map((c) => {
        const key = venueKey(c.id);
        return (
          <div key={key} ref={setCardRef(key)} className="min-w-0">
            <SearchResultCard
              center={c}
              entityKey={key}
              locale={locale}
              active={activeId === key}
              onHover={onHover}
              onSelect={onSelect}
            />
          </div>
        );
      })}
    </div>
  );
}

interface ProfessionalsListProps {
  professionals: Professional[];
  locale: string;
  activeId: string | null;
  onHover: (key: string | null) => void;
  onSelect: (key: string) => void;
  setCardRef: (key: string) => (el: HTMLDivElement | null) => void;
  emptyLabel: string;
}

function ProfessionalsList({
  professionals,
  locale,
  activeId,
  onHover,
  onSelect,
  setCardRef,
  emptyLabel,
}: ProfessionalsListProps) {
  if (!professionals.length) return <EmptyState label={emptyLabel} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {professionals.map((p) => (
        <div key={p.key} ref={setCardRef(p.key)} className="min-w-0">
          <ProfessionalCard
            professional={p}
            locale={locale}
            active={activeId === p.key}
            onHover={onHover}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
