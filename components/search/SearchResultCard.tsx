"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { generateCenterSlug } from "@/lib/slugify";
import type { CenterDetailData, Service } from "@/lib/apiEndpoints";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop";

const RATING = 4.8;
const REVIEW_COUNT = 128;

export interface SearchResultCardProps {
  center: CenterDetailData;
  locale: string;
  active?: boolean;
  onHover?: (id: number | null) => void;
  onSelect?: (id: number) => void;
}

function collectServicesPreview(c: CenterDetailData, max = 3): Service[] {
  const collected: Service[] = [];
  for (const cat of c.categories || []) {
    for (const s of cat.services || []) {
      collected.push(s);
      if (collected.length >= max) return collected;
    }
  }
  if (collected.length < max && c.services?.length) {
    for (const s of c.services) {
      collected.push(s);
      if (collected.length >= max) break;
    }
  }
  return collected;
}

export default function SearchResultCard({
  center,
  locale,
  active,
  onHover,
  onSelect,
}: SearchResultCardProps) {
  const t = useTranslations();
  const slug = generateCenterSlug(center.name, center.id);
  const cover =
    (center.primary_images?.length ? center.primary_images[0] : center.logo) ||
    FALLBACK_IMG;

  const cat = center.global_categories?.[0];
  const branch = center.branches?.[0];
  const services = collectServicesPreview(center, 3);
  const branchCount = center.branches?.length ?? 0;

  const isNew = center.rate === "new_to";
  const isTrending = center.rate === "trending";

  return (
    <motion.article
      whileHover={{ y: -2 }}
      onMouseEnter={() => onHover?.(center.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(center.id)}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white ring-1 transition-all",
        active
          ? "ring-2 ring-[#225D5C] shadow-lg"
          : "ring-gray-100 hover:shadow-md hover:ring-gray-200"
      )}
    >
      <Link href={`/${locale}/center/${slug}`} className="block">
        <div className="relative aspect-[5/3] w-full overflow-hidden bg-gray-100">
          <img
            src={cover}
            alt={center.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {isNew && <Badge variant="new">New</Badge>}
            {isTrending && <Badge variant="trending">Trending</Badge>}
          </div>

          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {RATING.toFixed(1)}
            <span className="font-normal text-gray-500">
              ({REVIEW_COUNT.toLocaleString()})
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-bold text-[#225D5C]">
            {center.name}
          </h3>
          {cat && (
            <span className="shrink-0 rounded-full bg-[#225D5C]/10 px-2 py-0.5 text-[11px] font-medium text-[#225D5C]">
              {locale === "ar" ? cat.nameAr || cat.name : cat.name}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
          {branch && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="shrink-0 text-gray-400" />
              <span className="truncate">
                {[branch.city, branch.address].filter(Boolean).join(" • ")}
              </span>
            </span>
          )}
          {branchCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
              {t("branch_count", { count: branchCount })}
            </span>
          )}
        </div>

        {services.length > 0 && (
          <ul className="mt-1 divide-y divide-gray-100 overflow-hidden rounded-xl bg-gray-50/70">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="truncate text-gray-800">{s.name}</span>
                <span className="shrink-0 font-semibold text-gray-900">
                  {typeof s.price === "number"
                    ? s.price.toLocaleString()
                    : s.price}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
}
