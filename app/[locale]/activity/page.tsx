"use client";

import React, { useState, useEffect, useMemo } from "react";
import Container from "@/components/ui/Container";
import AccountSidebar from "@/components/account/AccountSidebar";
import Button from "@/components/ui/Button";
import { fetchUserProfile, fetchBookingsList } from "@/lib/api";
import type { BookingListItem } from "@/lib/apiEndpoints";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Search,
    Calendar,
    MapPin,
    Store,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateCenterSlug } from "@/lib/slugify";
import { useTranslations } from "next-intl";

const BORDER = "#225D5C";
const HERO_FALLBACK =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=640&fit=crop&q=80";

type ActivityTab = "all" | "appointments" | "gift_cards" | "memberships" | "products";

function todayKey(): string {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, "0");
    const d = String(n.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function isUpcomingBooking(bookingDate: string): boolean {
    return bookingDate >= todayKey();
}

function formatDuration(fromTime: string, toTime: string): string {
    const parse = (t: string) => {
        const [h, m] = t.split(":").map((x) => parseInt(x, 10) || 0);
        return h * 60 + m;
    };
    const start = parse(fromTime);
    let end = parse(toTime);
    if (end <= start) end += 24 * 60;
    const mins = end - start;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const parts: string[] = [];
    if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
    if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
    return parts.join(", ") || "—";
}

function formatDurationLabel(value: string, t: ReturnType<typeof useTranslations>): string {
    if (!value || value === "—") return value || "—";
    return value
        .replace(/\bhours?\b/g, (m) => (m === "hour" ? t("activity_hour") : t("activity_hours")))
        .replace(/\bminutes?\b/g, (m) => (m === "minute" ? t("activity_minute") : t("activity_minutes")));
}

function formatDateTimeLabel(bookingDate: string, fromTime: string): string {
    const d = new Date(`${bookingDate}T12:00:00`);
    const time = fromTime
        ? new Date(`2000-01-01T${fromTime.length === 5 ? fromTime + ":00" : fromTime}`).toLocaleTimeString(
              "en-US",
              { hour: "numeric", minute: "2-digit", hour12: true }
          )
        : "";
    const dateStr = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    return time ? `${dateStr} at ${time.replace(" ", "").toLowerCase()}` : dateStr;
}

function daysUntil(bookingDate: string): number | null {
    const d = new Date(`${bookingDate}T12:00:00`);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
    if (diff < 0) return null;
    return diff;
}

function upcomingLabel(bookingDate: string, t: ReturnType<typeof useTranslations>): string | null {
    const d = daysUntil(bookingDate);
    if (d === null) return null;
    if (d === 0) return t("activity_today");
    if (d === 1) return t("activity_tomorrow");
    return t("activity_in_days", { days: d });
}
 
function bookingReference(id: number): string {
    return id.toString(16).toUpperCase().padStart(8, "0").slice(-8);
}

function bookingHeroImage(b: BookingListItem): string {
    const primary = b.center_primary_images?.filter(Boolean)[0];
    if (primary) return primary;
    if (b.center_logo) return b.center_logo;
    const svc = b.services?.[0]?.image;
    if (svc) return svc;
    return HERO_FALLBACK;
}

function parseCoord(v: string | number | null | undefined): number | null {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : null;
}

function branchHasCoords(b: BookingListItem): boolean {
    return parseCoord(b.branch?.latitude) != null && parseCoord(b.branch?.longitude) != null;
}

/** Google Maps directions when lat/lng exist; otherwise search by venue name. */
function getDirectionsUrl(b: BookingListItem): string {
    const lat = parseCoord(b.branch?.latitude);
    const lng = parseCoord(b.branch?.longitude);
    if (lat != null && lng != null) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    const q = encodeURIComponent(`${b.center_name} ${b.branch?.name || ""}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function statusBadgeClass(status: string): string {
    const s = status.toLowerCase();
    if (s === "confirmed" || s === "complete" || s === "completed")
        return "bg-[#225D5C] text-[#FFD6A8]";
    if (s === "cancelled" || s === "canceled") return "bg-gray-200 text-gray-700";
    return "bg-amber-100 text-amber-900";
}

export default function ActivityPage() {
    const t = useTranslations();
    const router = useRouter();
    const [user, setUser] = useState<{ name?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<BookingListItem[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [tab, setTab] = useState<ActivityTab>("all");
    const [search, setSearch] = useState("");
    /** On small screens: list vs full-width detail (avoids stacking list + long scroll). */
    const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const sync = () => {
            if (mq.matches) setMobileDetailOpen(false);
        };
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (mobileDetailOpen) window.scrollTo({ top: 0, behavior: "auto" });
    }, [mobileDetailOpen]);

    const selectBooking = (id: number) => {
        setSelectedId(id);
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
            setMobileDetailOpen(true);
        }
    };

    useEffect(() => {
        const run = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const profile = await fetchUserProfile(token);
            if (!profile) {
                localStorage.removeItem("authToken");
                router.push("/login");
                setLoading(false);
                return;
            }
            setUser(profile);
            const list = await fetchBookingsList(token);
            setBookings(list);
            setLoading(false);
        };
        void run();
    }, [router]);

    const filteredByTab = useMemo(() => {
        if (tab === "all" || tab === "appointments") return bookings;
        return [];
    }, [bookings, tab]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return filteredByTab;
        return filteredByTab.filter(
            (b) =>
                b.center_name.toLowerCase().includes(q) ||
                b.full_name.toLowerCase().includes(q) ||
                String(b.id).includes(q)
        );
    }, [filteredByTab, search]);

    const upcoming = useMemo(
        () =>
            [...filtered]
                .filter((b) => isUpcomingBooking(b.booking_date))
                .sort((a, b) => a.booking_date.localeCompare(b.booking_date) || a.id - b.id),
        [filtered]
    );

    const past = useMemo(
        () =>
            [...filtered]
                .filter((b) => !isUpcomingBooking(b.booking_date))
                .sort((a, b) => b.booking_date.localeCompare(a.booking_date) || b.id - a.id),
        [filtered]
    );

    const listForSidebar = useMemo(() => [...upcoming, ...past], [upcoming, past]);

    const effectiveSelectedId = useMemo(() => {
        if (listForSidebar.length === 0) return null;
        const ids = new Set(listForSidebar.map((b) => b.id));
        if (selectedId !== null && ids.has(selectedId)) return selectedId;
        return listForSidebar[0].id;
    }, [listForSidebar, selectedId]);

    const selected = useMemo(() => {
        if (effectiveSelectedId === null) return null;
        return listForSidebar.find((b) => b.id === effectiveSelectedId) ?? null;
    }, [listForSidebar, effectiveSelectedId]);

    const primaryService = selected?.services?.[0];
    const durationLabel =
        primaryService && primaryService.from_time && primaryService.to_time
            ? formatDurationLabel(formatDuration(primaryService.from_time, primaryService.to_time), t)
            : null;
    const dateTimeLabel =
        selected && primaryService
            ? formatDateTimeLabel(selected.booking_date, primaryService.from_time)
            : selected
              ? formatDateTimeLabel(selected.booking_date, "")
              : "";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225D5C]" />
            </div>
        );
    }

    const tabs: { id: ActivityTab; label: string }[] = [
        { id: "all", label: t("all") },
        { id: "appointments", label: t("activity_appointments") },
        { id: "gift_cards", label: t("activity_gift_cards") },
        { id: "memberships", label: t("activity_memberships") },
        { id: "products", label: t("activity_products") },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <Container>
                <div className="flex flex-col lg:flex-row gap-10">
                    <AccountSidebar userName={user?.name} />

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("activity")}</h1>
                            <div className="relative max-w-xs w-full sm:w-64">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                    aria-hidden
                                />
                                <input
                                    type="search"
                                    placeholder={t("activity_search_bookings")}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#225D5C]/30 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225D5C]/40"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {tabs.map((tabItem) => (
                                <button
                                    key={tabItem.id}
                                    type="button"
                                    onClick={() => {
                                        setTab(tabItem.id);
                                        setMobileDetailOpen(false);
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                                        tab === tabItem.id
                                            ? "bg-gray-900 text-white"
                                            : "bg-white text-gray-700 border border-gray-200 hover:border-[#225D5C]/40"
                                    )}
                                >
                                    {tabItem.label}
                                </button>
                            ))}
                        </div>

                        {tab !== "all" && tab !== "appointments" ? (
                            <div
                                className="rounded-2xl border border-dashed p-12 text-center text-gray-500 bg-white"
                                style={{ borderColor: `${BORDER}55` }}
                            >
                                {t("activity_no_tab_yet", { tab: tabs.find((x) => x.id === tab)?.label.toLowerCase() || "" })}
                            </div>
                        ) : listForSidebar.length === 0 ? (
                            <div
                                className="rounded-2xl border bg-white p-12 text-center text-gray-600"
                                style={{ borderColor: `${BORDER}66` }}
                            >
                                <p className="font-medium text-gray-900 mb-1">{t("activity_no_bookings")}</p>
                                <p className="text-sm">{t("activity_no_bookings_hint")}</p>
                                <Button className="mt-6" variant="primary" size="md" onClick={() => router.push("/")}>
                                    {t("activity_browse_venues")}
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* List — full width on mobile until a booking opens */}
                                <div
                                    className={cn(
                                        "space-y-8 lg:col-span-5",
                                        mobileDetailOpen && "hidden lg:block"
                                    )}
                                >
                                    {upcoming.length > 0 && (
                                        <section>
                                            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                {t("activity_upcoming")}
                                                <span
                                                    className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full text-xs font-bold text-[#225D5C] bg-white border px-1.5"
                                                    style={{ borderColor: `${BORDER}99` }}
                                                >
                                                    {upcoming.length}
                                                </span>
                                            </h2>
                                            <ul className="space-y-3">
                                                {upcoming.map((b) => (
                                                    <li key={b.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => selectBooking(b.id)}
                                                            className={cn(
                                                                "w-full text-left rounded-2xl border-2 p-3 flex gap-3 transition-all bg-white hover:shadow-md",
                                                                effectiveSelectedId === b.id
                                                                    ? "shadow-md ring-1 ring-[#225D5C]/20"
                                                                    : "border-gray-100"
                                                            )}
                                                            style={{
                                                                borderColor:
                                                                    effectiveSelectedId === b.id ? BORDER : undefined,
                                                            }}
                                                        >
                                                            <div className="relative h-16 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                                <Image
                                                                    src={bookingHeroImage(b)}
                                                                    alt=""
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="80px"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-bold text-gray-900 truncate">
                                                                    {b.center_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {formatDateTimeLabel(
                                                                        b.booking_date,
                                                                        b.services[0]?.from_time || ""
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {t("activity_currency_aed")} {b.total_price} · {b.services.length} {b.services.length === 1 ? t("activity_item") : t("activity_items")}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {past.length > 0 && (
                                        <section>
                                            <h2 className="text-sm font-bold text-gray-500 mb-3">{t("activity_past")}</h2>
                                            <ul className="space-y-3">
                                                {past.map((b) => (
                                                    <li key={b.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => selectBooking(b.id)}
                                                            className={cn(
                                                                "w-full text-left rounded-2xl border p-3 flex gap-3 transition-all bg-white/80 hover:bg-white border-gray-100",
                                                                effectiveSelectedId === b.id && "border-2 shadow-sm"
                                                            )}
                                                            style={{
                                                                borderColor:
                                                                    effectiveSelectedId === b.id ? BORDER : undefined,
                                                            }}
                                                        >
                                                            <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 opacity-90">
                                                                <Image
                                                                    src={bookingHeroImage(b)}
                                                                    alt=""
                                                                    fill
                                                                    className="object-cover grayscale-[20%]"
                                                                    sizes="72px"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-800 truncate text-sm">
                                                                    {b.center_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatDateTimeLabel(
                                                                        b.booking_date,
                                                                        b.services[0]?.from_time || ""
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                </div>

                                {/* Detail — hidden on mobile until a booking is selected */}
                                {selected && (
                                    <div
                                        className={cn(
                                            "min-w-0 lg:col-span-7",
                                            !mobileDetailOpen && "hidden lg:block"
                                        )}
                                    >
                                        <div
                                            className="rounded-3xl border bg-white overflow-hidden shadow-sm"
                                            style={{ borderColor: `${BORDER}55` }}
                                        >
                                            {/* Mobile: fixed layout row above hero (no sticky overlay on image) */}
                                            <div className="lg:hidden flex min-h-[3.25rem] items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setMobileDetailOpen(false)}
                                                    className="flex shrink-0 items-center gap-0.5 rounded-lg px-1 py-1 text-sm font-semibold text-[#225D5C] hover:bg-[#225D5C]/8 active:bg-[#225D5C]/12"
                                                >
                                                    <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
                                                    <span>{t("activity_bookings")}</span>
                                                </button>
                                                <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-gray-900">
                                                    {selected.center_name}
                                                </span>
                                            </div>

                                            <div className="relative h-48 w-full overflow-hidden bg-gray-100 sm:h-56 lg:h-64">
                                                <Image
                                                    src={bookingHeroImage(selected)}
                                                    alt={selected.center_name}
                                                    width={1920}
                                                    height={1080}
                                                    priority
                                                    sizes="100vw"
                                                    unoptimized
                                                    className="h-full w-full object-cover object-center"
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    {upcomingLabel(selected.booking_date, t) && (
                                                        <p className="text-xs font-medium text-white/90 mb-1">
                                                            {upcomingLabel(selected.booking_date, t)}
                                                        </p>
                                                    )}
                                                    <p className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                                                        {selected.center_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-8 overflow-y-auto p-5 sm:p-8 lg:max-h-[calc(100vh-12rem)]">
                                                <div>
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize",
                                                            statusBadgeClass(selected.booking_status)
                                                        )}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        {selected.booking_status}
                                                    </span>
                                                    <h3 className="text-2xl font-bold text-gray-900 mt-4">
                                                        {dateTimeLabel}
                                                    </h3>
                                                    {durationLabel && (
                                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                                            <Clock size={16} className="shrink-0" />
                                                            {durationLabel} {t("activity_duration")}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {/* <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="md"
                                                        className="w-full justify-start gap-3 border-[#225D5C]/35 hover:bg-[#225D5C]/5"
                                                        onClick={() => downloadCalendarIcs(selected)}
                                                    >
                                                        <Calendar size={18} className="text-[#225D5C]" />
                                                        Add to calendar
                                                    </Button> */}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="md"
                                                        className="w-full justify-start gap-3 border-[#225D5C]/35 hover:bg-[#225D5C]/5"
                                                        onClick={() =>
                                                            window.open(getDirectionsUrl(selected), "_blank", "noopener,noreferrer")
                                                        }
                                                    >
                                                        <MapPin size={18} className="text-[#225D5C]" />
                                                        {t("get_directions")}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="md"
                                                        className="w-full justify-start gap-3 border-[#225D5C]/35 hover:bg-[#225D5C]/5"
                                                        onClick={() =>
                                                            router.push(
                                                                `/center/${generateCenterSlug(selected.center_name, selected.center_id)}`
                                                            )
                                                        }
                                                    >
                                                        <Store size={18} className="text-[#225D5C]" />
                                                        {t("activity_venue_details")}
                                                        <ChevronRight
                                                            size={18}
                                                            className="ml-auto text-gray-400"
                                                            aria-hidden
                                                        />
                                                    </Button>
                                                </div>

                                                <section>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-3">{t("activity_overview")}</h4>
                                                    <div
                                                        className="rounded-2xl border p-4 space-y-3"
                                                        style={{ borderColor: `${BORDER}44` }}
                                                    >
                                                        <div className="flex justify-between gap-4 text-sm">
                                                            <span className="flex items-start gap-2 text-gray-700 min-w-0">
                                                         
                                                                {primaryService?.image ? (
                                                                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                                        <Image
                                                                            src={primaryService.image}
                                                                            alt=""
                                                                            width={40}
                                                                            height={40}
                                                                            className="h-10 w-10 object-cover"
                                                                            unoptimized
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                                <span className="min-w-0">
                                                                    {selected.services.map((s) => s.name).join(" · ")}
                                                                </span>
                                                            </span>
                                                            <span className="font-semibold text-gray-900 shrink-0">
                                                                AED {selected.total_price}
                                                            </span>
                                                        </div>
                                                        {durationLabel && (
                                                            <p className="text-xs text-gray-500">
                                                                {durationLabel} · {selected.services.length} {selected.services.length === 1 ? t("activity_service") : t("activity_services")}
                                                            </p>
                                                        )}
                                                        <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                                                            <span className="font-bold text-gray-900">{t("activity_total")}</span>
                                                            <span className="text-lg font-bold text-gray-900">
                                                                {t("activity_currency_aed")} {selected.total_price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </section>

                                                <section>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-3">
                                                        {t("activity_more_details")}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        {t("activity_cancel_policy")}
                                                    </p>
                                                    {/* <div className="flex flex-col gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="md"
                                                            className="w-full justify-between border-[#225D5C]/35"
                                                            onClick={() =>
                                                                alert("Contact the venue to reschedule this booking.")
                                                            }
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <Calendar size={18} className="text-[#225D5C]" />
                                                                Reschedule appointment
                                                            </span>
                                                            <ChevronRight size={18} className="text-gray-400" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="md"
                                                            className="w-full justify-between border-red-200 text-red-700 hover:bg-red-50"
                                                            onClick={() =>
                                                                alert("Contact the venue to cancel this booking.")
                                                            }
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Cancel appointment
                                                            </span>
                                                            <ChevronRight size={18} className="text-gray-400" />
                                                        </Button>
                                                    </div> */}
                                                </section>

                                                <section>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-3">
                                                        {t("activity_getting_there")}
                                                    </h4>
                                                    {/* <a
                                                        href={getDirectionsUrl(selected)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block relative h-44 rounded-xl overflow-hidden bg-gray-100 border border-[#225D5C]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#225D5C]"
                                                    >
                                                        {branchStaticMapUrl(selected) ? (
                                                            <Image
                                                                src={branchStaticMapUrl(selected)}
                                                                alt={`Map: ${selected.branch?.name || selected.center_name}`}
                                                                fill
                                                                className="object-cover"
                                                                sizes="400px"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <Image
                                                                src={HERO_FALLBACK}
                                                                alt=""
                                                                fill
                                                                className="object-cover opacity-80"
                                                                sizes="400px"
                                                            />
                                                        )}
                                                    </a> */}
                                                    <p className="text-sm text-gray-700 mt-3">
                                                        <span className="font-medium">{selected.branch?.name}</span>
                                                        {selected.center_name ? ` · ${selected.center_name}` : ""}
                                                        {branchHasCoords(selected) && (
                                                            <span className="block text-xs text-gray-500 mt-0.5 font-normal">
                                                                {parseCoord(selected.branch.latitude)?.toFixed(5)},{" "}
                                                                {parseCoord(selected.branch.longitude)?.toFixed(5)}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <a
                                                        href={getDirectionsUrl(selected)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-sm font-semibold text-[#225D5C] hover:underline mt-1 inline-block"
                                                    >
                                                        {t("activity_open_in_maps")}
                                                    </a>
                                                </section>

                                                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                                                    {t("activity_booking_reference")} {bookingReference(selected.id)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
