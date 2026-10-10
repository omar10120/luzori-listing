"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import AccountSidebar from "@/components/account/AccountSidebar";
import Button from "@/components/ui/Button";
import { fetchUserProfile, fetchUserFavorites, toggleCenterFavorite } from "@/lib/api";
import type { FavoriteCenter, FavoritesPagination } from "@/lib/apiEndpoints";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { generateCenterSlug } from "@/lib/slugify";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop";

export default function FavoritesPage() {
    const router = useRouter();
    const t = useTranslations();
    const [user, setUser] = useState<{ name?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<FavoriteCenter[]>([]);
    const [pagination, setPagination] = useState<FavoritesPagination>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [page, setPage] = useState(1);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.push("/login");
                return;
            }

            const [profile, list] = await Promise.all([
                fetchUserProfile(token),
                fetchUserFavorites(token, page),
            ]);

            if (!profile) {
                localStorage.removeItem("authToken");
                router.push("/login");
                return;
            }

            setUser(profile);
            setFavorites(list.favorites);
            setPagination(list.pagination);
            setLoading(false);
        };

        void load();
    }, [router, page]);

    const removeFavorite = async (centerId: number) => {
        const token = localStorage.getItem("authToken");
        if (!token || removingId !== null) return;

        setRemovingId(centerId);
        const result = await toggleCenterFavorite(token, centerId);
        setRemovingId(null);

        if (!result.success || result.isFavorite === true) {
            toast.error(result.message || t("favorite_failed"));
            return;
        }

        setFavorites((prev) => prev.filter((center) => center.id !== centerId));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        toast.success(t("favorite_updated"));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225D5C]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <Container>
                <div className="flex flex-col lg:flex-row gap-12">
                    <AccountSidebar userName={user?.name} />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("favorites")}</h1>

                        {favorites.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#225D5C]/30 bg-white p-12 text-center">
                                <p className="font-medium text-gray-900 mb-1">{t("favorites_empty")}</p>
                                <p className="text-sm text-gray-500">{t("favorites_empty_hint")}</p>
                                <Button className="mt-6" onClick={() => router.push("/")}>
                                    {t("activity_browse_venues")}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {favorites.map((center) => {
                                        const image = center.primary_images?.find(Boolean) || center.logo || FALLBACK_IMAGE;
                                        const savedOn = center.favorited_at?.split(" ")[0] || "";
                                        const categories = center.global_categories?.map((category) => category.name).filter(Boolean) ?? [];

                                        return (
                                            <article
                                                key={center.id}
                                                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                                            >
                                                <Link href={`/center/${generateCenterSlug(center.name, center.id)}`} className="block">
                                                    <div className="relative aspect-[6/4] w-full overflow-hidden bg-gray-100">
                                                        <img
                                                            src={image}
                                                            alt={center.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <h2 className="text-base font-bold text-[#225D5C] line-clamp-1">{center.name}</h2>
                                                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                                            <MapPin size={14} className="shrink-0" />
                                                            <span className="line-clamp-1">{center.domain}</span>
                                                        </div>
                                                        {categories.length > 0 && (
                                                            <p className="mt-2 text-xs text-gray-400 line-clamp-1">{categories.join(" · ")}</p>
                                                        )}
                                                        {savedOn && (
                                                            <p className="mt-2 text-xs text-gray-400">{t("favorites_saved_on", { date: savedOn })}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => void removeFavorite(center.id)}
                                                    disabled={removingId === center.id}
                                                    aria-label={t("remove_from_favorites")}
                                                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm disabled:opacity-60"
                                                >
                                                    <Star size={16} className="fill-amber-400 text-amber-400" />
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>

                                {pagination.last_page > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            disabled={page <= 1}
                                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                                            aria-label={t("previous")}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
                                        >
                                            <ChevronLeft size={16} className="rtl:rotate-180" />
                                        </button>
                                        <span className="text-sm text-gray-500">
                                            {pagination.current_page} / {pagination.last_page}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={page >= pagination.last_page}
                                            onClick={() => setPage((current) => current + 1)}
                                            aria-label={t("see_more")}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
                                        >
                                            <ChevronRight size={16} className="rtl:rotate-180" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
