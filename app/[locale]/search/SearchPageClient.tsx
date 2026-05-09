"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LandingSearchBar from "@/components/search/LandingSearchBar";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import { fetchCentersSearchClient } from "@/lib/centersPublicApi";
import type { CenterDetailData } from "@/lib/apiEndpoints";
import type { Business } from "@/lib/types";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop";

function centerToBusiness(c: CenterDetailData): Business {
  const gc = c.global_categories?.[0];
  return {
    id: String(c.id),
    name: c.name,
    location: c.domain || "Local Area",
    category: gc?.name ?? "Selfcare Service",
    rating: 4.8,
    reviewCount: 120,
    image: (c.primary_images?.length ? c.primary_images[0] : c.logo) || FALLBACK_IMG,
    isNew: c.rate === "new_to",
    isTrending: c.rate === "trending",
  };
}

export default function SearchPageClient() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const slug = searchParams.get("global_category_slug");
  const id = searchParams.get("global_category_id");
  const date = searchParams.get("date");
  const timePreset = searchParams.get("time_preset") as "morning" | "afternoon" | "evening" | null;

  const [centers, setCenters] = useState<CenterDetailData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const businesses = useMemo(() => centers.map(centerToBusiness), [centers]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-16">
      <header className="sticky top-16 z-30 border-b border-gray-100 bg-[#FFFDFC]/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-[#FFFDFC]/85">
        <Container>
          <LandingSearchBar
            variant="header"
            initialCategorySlug={slug}
            initialCategoryId={id}
            initialDate={date}
            initialTimePreset={timePreset ? timePreset as "any" | "morning" | "afternoon" | "evening" : null}
          />
        </Container>
      </header>

      <Container className="pt-8">
        <h1 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">{t("search_results_title")}</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
          </div>
        ) : businesses.length === 0 ? (
          <p className="py-16 text-center text-gray-500">{t("search_no_results")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((biz) => (
              <Card key={biz.id} business={biz} className="!w-full max-w-xl justify-self-center" />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
