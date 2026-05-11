"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Map as MapIcon, List as ListIcon } from "lucide-react";

import LandingSearchBar from "@/components/search/LandingSearchBar";
import Container from "@/components/ui/Container";
import SearchResultCard from "@/components/search/SearchResultCard";
import { fetchCentersSearchClient } from "@/lib/centersPublicApi";
import type { CenterDetailData } from "@/lib/apiEndpoints";
import { cn } from "@/lib/utils";

const SearchMap = dynamic(() => import("@/components/search/SearchMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
    </div>
  ),
});

type MobileView = "list" | "map";

function countMarkers(centers: CenterDetailData[]): number {
  let n = 0;
  for (const c of centers) {
    for (const b of c.branches || []) {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) n++;
    }
  }
  return n;
}

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

  const [hoveredCenterId, setHoveredCenterId] = useState<number | null>(null);
  const [activeCenterId, setActiveCenterId] = useState<number | null>(null);
  const [focusBranch, setFocusBranch] = useState<
    { centerId: number; branchId: number; nonce: number } | null
  >(null);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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

  const totalMarkers = useMemo(() => countMarkers(centers), [centers]);

  const centersRef = useRef<CenterDetailData[]>(centers);
  useEffect(() => {
    centersRef.current = centers;
  }, [centers]);

  const handleCardSelect = useCallback((centerId: number) => {
    setActiveCenterId(centerId);
    const center = centersRef.current.find((c) => c.id === centerId);
    const branch = center?.branches?.find((b) => {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
    });
    if (branch) {
      setFocusBranch({ centerId, branchId: branch.id, nonce: Date.now() });
    }
  }, []);

  const handleMarkerClick = useCallback((centerId: number, _branchId: number) => {
    void _branchId;
    setActiveCenterId(centerId);
    const el = cardRefs.current.get(centerId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const setCardRef = useCallback(
    (centerId: number) => (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(centerId, el);
      else cardRefs.current.delete(centerId);
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

      <div className="mx-auto w-full max-w-[1600px] px-3 pt-6 sm:px-4 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {t("search_results_title")}
            </h1>
            {!loading && (
              <p className="mt-1 text-sm text-gray-500">
                {t("search_summary", { venues: centers.length, markers: totalMarkers })}
              </p>
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
          {/* LEFT: Results */}
          <section
            className={cn(
              "min-w-0",
              mobileView === "map" && "hidden lg:block"
            )}
          >
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
              </div>
            ) : centers.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-100">
                <p className="text-gray-500">{t("search_no_results")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {centers.map((c) => (
                  <div key={c.id} ref={setCardRef(c.id)} className="min-w-0">
                    <SearchResultCard
                      center={c}
                      locale={locale}
                      active={activeCenterId === c.id}
                      onHover={setHoveredCenterId}
                      onSelect={handleCardSelect}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: Sticky map */}
          <aside
            className={cn(
              "min-w-0",
              mobileView === "list" && "hidden lg:block"
            )}
          >
            <div className="lg:sticky lg:top-44">
              <div className="h-[60vh] w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:h-[calc(100vh-12rem)]">
                <SearchMap
                  centers={centers}
                  hoveredCenterId={hoveredCenterId}
                  activeCenterId={activeCenterId}
                  focusBranch={focusBranch}
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
