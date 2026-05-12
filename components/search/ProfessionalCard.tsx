"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { generateProfessionalSlug } from "@/lib/slugify";
import type { Professional } from "@/lib/searchEntities";

const RATING = 4.9;

export interface ProfessionalCardProps {
  professional: Professional;
  locale: string;
  active?: boolean;
  onHover?: (key: string | null) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ src, name }: { src?: string | null; name: string }) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#6B5B4F] text-2xl font-semibold text-white">
        {initials(name)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setErrored(true)}
      className="h-full w-full object-cover"
    />
  );
}

export default function ProfessionalCard({
  professional,
  locale,
  active,
  onHover,
}: ProfessionalCardProps) {
  const t = useTranslations();

  const profileHref = useMemo(
    () =>
      `/${locale}/professional/${generateProfessionalSlug(
        professional.name,
        professional.centerId,
        professional.workerId
      )}`,
    [locale, professional.name, professional.centerId, professional.workerId]
  );

  const preview = professional.services.slice(0, 2);
  const remaining = Math.max(professional.services.length - preview.length, 0);
  const role =
    professional.centerCategoryName ||
    professional.centerGlobalCategoryName ||
    professional.centerName;

  const locationLine = professional.branch
    ? [professional.branch.city, professional.branch.address]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <Link
      href={profileHref}
      onMouseEnter={() => onHover?.(professional.key)}
      onMouseLeave={() => onHover?.(null)}
      className="block"
    >
      <motion.article
        whileHover={{ y: -2 }}
        className={cn(
          "flex cursor-pointer flex-col gap-3 rounded-2xl bg-white p-4 ring-1 transition-all",
          active
            ? "ring-2 ring-[#225D5C] shadow-lg"
            : "ring-gray-100 hover:shadow-md hover:ring-gray-200"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white shadow-sm sm:h-24 sm:w-24">
              <Avatar src={professional.image} name={professional.name} />
            </div>
            <span className="absolute -bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-900 shadow-sm ring-1 ring-gray-100">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {RATING.toFixed(1)}
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h3 className="line-clamp-1 text-base font-bold text-gray-900">
              {professional.name}
            </h3>
            <p className="line-clamp-1 text-sm text-gray-500">{role}</p>
            {locationLine && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{locationLine}</span>
              </div>
            )}
          </div>
        </div>

        {preview.length > 0 && (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-gray-50/70">
            {preview.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {s.name}
                  </div>
                  {s.maxTime && (
                    <div className="text-[11px] text-gray-500">{s.maxTime}</div>
                  )}
                </div>
                <div className="shrink-0 text-sm font-semibold text-gray-900">
                  {typeof s.price === "number"
                    ? s.price.toLocaleString()
                    : s.price}
                </div>
              </li>
            ))}
          </ul>
        )}

        {remaining > 0 && (
          <span className="text-sm font-medium text-[#225D5C] hover:underline">
            {t("view_matching_services", {
              count: professional.services.length,
            })}
          </span>
        )}
      </motion.article>
    </Link>
  );
}
