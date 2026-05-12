"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Share2,
  BadgeCheck,
  Calendar as CalendarIcon,
  Building2,
  X,
} from "lucide-react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";

import LandingSearchBar from "@/components/search/LandingSearchBar";
import Container from "@/components/ui/Container";
import { fetchCentersSearchClient } from "@/lib/centersPublicApi";
import {
  findProfessionalProfile,
  flattenProfessionalServices,
  type ProfessionalCenterEntry,
  type ProfessionalProfile,
  type ProfessionalService,
} from "@/lib/searchEntities";
import {
  extractProfessionalIdsFromSlug,
  generateCenterSlug,
} from "@/lib/slugify";
import { cn } from "@/lib/utils";

interface Props {
  slug: string;
}

type TabKey = "services" | "portfolio" | "reviews" | "location";

const SERVICES_PREVIEW_COUNT = 6;

export default function ProfessionalPageClient({ slug }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  
  
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("services");
  const [showAllServices, setShowAllServices] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ids = extractProfessionalIdsFromSlug(slug);
    if (!ids) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    void fetchCentersSearchClient({}).then((centers) => {
      if (cancelled) return;
      const p = findProfessionalProfile(centers, ids.centerId, ids.workerId);
      if (!p) {
        setNotFound(true);
      } else {
        setProfile(p);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const allServices = useMemo(
    () => (profile ? flattenProfessionalServices(profile) : []),
    [profile]
  );

  const visibleServices = showAllServices
    ? allServices
    : allServices.slice(0, SERVICES_PREVIEW_COUNT);

  const counts = useMemo(
    () => ({
      services: allServices.length,
      portfolio: 0,
      reviews: 0,
      location: profile?.centers.length ?? 0,
    }),
    [allServices.length, profile?.centers.length]
  );

  const goToCenter = (centerEntry: ProfessionalCenterEntry): void => {
    const centerSlug = generateCenterSlug(centerEntry.centerName, centerEntry.centerId);
    router.push(`/${locale}/center/${centerSlug}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F7F7F7]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#F7F7F7]">
        <p className="text-gray-600">{t("professional_not_found")}</p>
        <Link
          href={`/${locale}/search`}
          className="rounded-full bg-[#225D5C] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t("back_to_search")}
        </Link>
      </div>
    );
  }

  const primaryAddress =
    profile.centers.find((c) => c.branch)?.branch?.city ??
    profile.centers[0]?.branch?.city ??
    profile.centers[0]?.centerName ??
    "";
  const primaryAddressLine = (() => {
    const c = profile.centers.find((x) => x.branch) ?? profile.centers[0];
    if (!c) return "";
    if (c.branch)
      return [c.branch.city, c.branch.address].filter(Boolean).join(", ");
    return c.centerName;
  })();

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-16">
      <header className="sticky top-16 z-30 border-b border-gray-100 bg-[#FFFDFC]/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-[#FFFDFC]/85">
        <Container>
          <LandingSearchBar variant="header" />
        </Container>
      </header>

      <Container className="pt-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-8">
          <ProfessionalSidebar
            profile={profile}
            primaryAddress={primaryAddress}
            primaryAddressLine={primaryAddressLine}
            onBookNow={() => setBookOpen(true)}
          />

          <section className="min-w-0">
            <TabBar
              active={activeTab}
              onChange={setActiveTab}
              counts={counts}
              labels={{
                services: t("tab_services"),
                portfolio: t("tab_portfolio"),
                reviews: t("tab_reviews"),
                location: t("tab_location"),
              }}
            />

            <div className="mt-6">
              {activeTab === "services" && (
                <ServicesPanel
                  title={t("tab_services")}
                  services={visibleServices}
                  total={allServices.length}
                  expanded={showAllServices}
                  onToggleExpanded={() => setShowAllServices((v) => !v)}
                  onBook={(service) => {
                    const entry = profile.centers.find(
                      (c) => c.centerId === service.centerId
                    );
                    if (entry) goToCenter(entry);
                  }}
                  bookLabel={t("book")}
                  seeAllLabel={t("see_all")}
                  showLessLabel={t("show_less")}
                  fromLabel={t("from")}
                  emptyLabel={t("no_services_yet")}
                />
              )}

              {activeTab === "portfolio" && (
                <ComingSoonPanel title={t("tab_portfolio")} />
              )}
              {activeTab === "reviews" && (
                <ComingSoonPanel title={t("tab_reviews")} />
              )}
              {activeTab === "location" && (
                <LocationPanel
                  centers={profile.centers}
                  locale={locale}
                  emptyLabel={t("no_location_yet")}
                />
              )}
            </div>
          </section>
        </div>
      </Container>

      <BookCenterDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        centers={profile.centers}
        onSelect={(entry) => {
          setBookOpen(false);
          goToCenter(entry);
        }}
        title={t("book_choose_center")}
        emptyLabel={t("no_centers_for_pro")}
      />
    </div>
  );
}

interface ProfessionalSidebarProps {
  profile: ProfessionalProfile;
  primaryAddress: string;
  primaryAddressLine: string;
  onBookNow: () => void;
}

function ProfessionalSidebar({
  profile,
  primaryAddress,
  primaryAddressLine,
  onBookNow,
}: ProfessionalSidebarProps) {
  const t = useTranslations();
  return (
    <aside className="lg:sticky lg:top-44 lg:self-start">
      <div className="relative overflow-hidden rounded-2xl bg-[#F1EFEC] p-6 ring-1 ring-gray-200/60">
        <button
          type="button"
          aria-label={t("share")}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50"
          onClick={() => {
            if (typeof window === "undefined") return;
            const nav = window.navigator as Navigator & {
              share?: (data: ShareData) => Promise<void>;
            };
            if (typeof nav.share === "function") {
              void nav
                .share({ url: window.location.href, title: profile.name })
                .catch(() => undefined);
            } else {
              void nav.clipboard?.writeText(window.location.href);
            }
          }}
        >
          <Share2 size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="h-40 w-40 overflow-hidden rounded-full bg-white shadow-sm ring-4 ring-white">
              <ProAvatar src={profile.image} name={profile.name} />
            </div>
            <span className="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm ring-2 ring-white">
              <BadgeCheck size={14} />
            </span>
          </div>

          <h1 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
            {profile.name}
          </h1>
          {profile.role && (
            <p className="mt-1 text-sm text-gray-600">{profile.role}</p>
          )}

          <div className="mt-2 inline-flex items-center gap-1 text-sm text-gray-700">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold">5.0</span>
            <span className="text-gray-500">(1,649)</span>
          </div>

          {primaryAddress && (
            <p className="mt-1 text-sm text-gray-600">{primaryAddress}</p>
          )}
          {primaryAddressLine && primaryAddressLine !== primaryAddress && (
            <p className="text-xs text-gray-500">{primaryAddressLine}</p>
          )}

          <button
            type="button"
            onClick={onBookNow}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
          >
            {t("book_now")}
          </button>
        </div>

        <div className="mt-6 space-y-3 border-t border-gray-200/70 pt-5 text-sm">
          <Stat
            icon={<CalendarIcon size={14} />}
            label={t("services_offered")}
            value={profile.centers.reduce(
              (a, c) => a + c.services.length,
              0
            )}
          />
          <Stat
            icon={<Building2 size={14} />}
            label={t("centers_count_label")}
            value={profile.centers.length}
          />
        </div>

        {profile.role && (
          <div className="mt-5 border-t border-gray-200/70 pt-5">
            <h3 className="text-sm font-semibold text-gray-900">
              {t("about")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {t("about_professional_blurb", {
                name: profile.name,
                role: profile.role,
              })}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-gray-700">
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-gray-900">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

interface TabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
  counts: Record<TabKey, number>;
  labels: Record<TabKey, string>;
}

function TabBar({ active, onChange, counts, labels }: TabBarProps) {
  const items: TabKey[] = ["services", "portfolio", "reviews", "location"];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((key) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
            )}
          >
            <span>{labels[key]}</span>
            {counts[key] > 0 && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {counts[key] > 99 ? "99+" : counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ServicesPanelProps {
  title: string;
  services: Array<
    ProfessionalService & { centerId: number; centerName: string }
  >;
  total: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onBook: (
    s: ProfessionalService & { centerId: number; centerName: string }
  ) => void;
  bookLabel: string;
  seeAllLabel: string;
  showLessLabel: string;
  fromLabel: string;
  emptyLabel: string;
}

function ServicesPanel({
  title,
  services,
  total,
  expanded,
  onToggleExpanded,
  onBook,
  bookLabel,
  seeAllLabel,
  showLessLabel,
  fromLabel,
  emptyLabel,
}: ServicesPanelProps) {
  if (!total) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-gray-100">
        <p className="text-gray-500">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
      <div className="flex flex-col gap-3">
        {services.map((s) => (
          <motion.div
            key={`${s.centerId}-${s.id}`}
            whileHover={{ y: -1 }}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition-shadow hover:shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-semibold text-gray-900">
                {s.name}
              </div>
              {s.maxTime && (
                <div className="mt-0.5 text-xs text-gray-500">{s.maxTime}</div>
              )}
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs">
                <span className="text-gray-500">{fromLabel}</span>
                <span className="font-semibold text-gray-900">
                  {typeof s.price === "number"
                    ? s.price.toLocaleString()
                    : s.price}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{s.centerName}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBook(s)}
              className="shrink-0 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              {bookLabel}
            </button>
          </motion.div>
        ))}
      </div>

      {total > SERVICES_PREVIEW_COUNT && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {expanded ? showLessLabel : seeAllLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function ComingSoonPanel({ title }: { title: string }) {
  const t = useTranslations();
  return (
    <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-gray-100">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{t("coming_soon")}</p>
    </div>
  );
}

function LocationPanel({
  centers,
  locale,
  emptyLabel,
}: {
  centers: ProfessionalCenterEntry[];
  locale: string;
  emptyLabel: string;
}) {
  const items = centers.filter((c) => c.branch);
  if (!items.length) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-gray-100">
        <p className="text-gray-500">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((c) => {
        const centerSlug = generateCenterSlug(c.centerName, c.centerId);
        return (
          <Link
            key={c.centerId}
            href={`/${locale}/center/${centerSlug}`}
            className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition-shadow hover:shadow-sm"
          >
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#225D5C]" />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-semibold text-gray-900">
                {c.centerName}
              </div>
              {c.branch && (
                <div className="text-xs text-gray-500">
                  {[c.branch.city, c.branch.address]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

interface BookCenterDialogProps {
  open: boolean;
  onClose: () => void;
  centers: ProfessionalCenterEntry[];
  onSelect: (c: ProfessionalCenterEntry) => void;
  title: string;
  emptyLabel: string;
}

function BookCenterDialog({
  open,
  onClose,
  centers,
  onSelect,
  title,
  emptyLabel,
}: BookCenterDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="book-center-dialog-title"
    >
      <DialogTitle
        id="book-center-dialog-title"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        {title}
        <IconButton size="small" onClick={onClose} aria-label="close">
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {centers.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">{emptyLabel}</p>
        ) : (
          <List disablePadding>
            {centers.map((c) => (
              <ListItemButton key={c.centerId} onClick={() => onSelect(c)}>
                <ListItemAvatar>
                  <Avatar src={c.centerLogo ?? undefined}>
                    {c.centerName.slice(0, 1).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.centerName}
                  secondary={
                    c.branch
                      ? [c.branch.city, c.branch.address]
                          .filter(Boolean)
                          .join(" · ")
                      : c.branchName ?? ""
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProAvatar({ src, name }: { src?: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    const initials = name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#6B5B4F] text-3xl font-semibold text-white">
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className="h-full w-full object-cover"
    />
  );
}
