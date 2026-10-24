"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import type { CenterDetailData, CenterPackage, CenterReview, Service, UserPurchasedPackage } from "@/lib/apiEndpoints";
import type { SelectedService } from '@/features/center-details/booking/BookingWizard';

import Header from '@/features/center-details/sections/Header';
import HeroBase from '@/features/center-details/sections/HeroBase';
import Gallery from '@/features/center-details/sections/Gallery';
import Services from '@/features/center-details/sections/Services';
import About from '@/features/center-details/sections/About';
import Team from '@/features/center-details/sections/Team';
import Reviews from '@/features/center-details/sections/Reviews';
import Sidebar from '@/features/center-details/sections/Sidebar';
import BookingWizard from '@/features/center-details/booking/BookingWizard';
import PackagePurchaseWizard from '@/features/center-details/packages/PackagePurchaseWizard';
import { useTranslations } from "next-intl";
import {
    createCenterReview,
    deleteCenterReview,
    fetchCenterById,
    fetchCenterReviews,
    fetchCenterWorkers,
    fetchMyCenterReview,
    fetchUserPurchasedPackages,
    toggleCenterFavorite,
    updateCenterReview,
} from "@/lib/api";
import toast from "react-hot-toast";

const BOOKING_RESUME_KEY = "luzori_booking_resume_state";

// Safe storage helpers to prevent iOS Safari crashes
const getAuthToken = () => {
    try {
        if (typeof window !== 'undefined') return window.localStorage.getItem("authToken");
    } catch (e) {
        console.warn("localStorage is not available", e);
    }
    return null;
};

const getResumeState = () => {
    try {
        if (typeof window !== 'undefined') return window.sessionStorage.getItem(BOOKING_RESUME_KEY);
    } catch (e) {
        console.warn("sessionStorage is not available", e);
    }
    return null;
};

/* ─── Main Component ─────────────────────────────────────────────── */

interface Props {
    center: CenterDetailData;
}

export default function CenterDetailClient({ center }: Props) {
    const t = useTranslations();
    const [activeServiceTab, setActiveServiceTab] = useState("all");
    const [isFav, setIsFav] = useState(Boolean(center?.is_favorite));
    const [favLoading, setFavLoading] = useState(false);
    const favLock = React.useRef(false);
    const [isBookingMode, setIsBookingMode] = useState(false);
    const [isPackageCheckoutMode, setIsPackageCheckoutMode] = useState(false);
    const [preSelectedServices, setPreSelectedServices] = useState<SelectedService[]>([]);
    const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
    const [purchasedPackages, setPurchasedPackages] = useState<UserPurchasedPackage[]>([]);
    const [team, setTeam] = useState<{ id: number; name: string; role: string; avatar: string }[]>([]);
    const [teamPage, setTeamPage] = useState(1);
    const [teamLastPage, setTeamLastPage] = useState(1);
    const [teamLoading, setTeamLoading] = useState(true);
    const [reviews, setReviews] = useState<CenterReview[]>([]);
    const [myReview, setMyReview] = useState<CenterReview | null>(null);
    const [reviewsAvg, setReviewsAvg] = useState<number | null>(center?.avg_rating == null ? null : Number(center.avg_rating));
    const [reviewsCount, setReviewsCount] = useState(center?.reviews_count ?? 0);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsLastPage, setReviewsLastPage] = useState(1);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);
    const [reviewsReady, setReviewsReady] = useState(false);

    const handleBookNow = (service?: Service & { category?: string }) => {
        if (service) {
            setPreSelectedServices([{ ...service, categoryName: service.category }]);
        } else {
            setPreSelectedServices([]);
        }
        setIsBookingMode(true);
    };

    // Derived Tabs from API
    const centerPackages = center?.packages || [];
    const categoryTabs = [
        "all",
        ...(center?.categories?.map(c => c?.name).filter(Boolean) || []),
        ...(centerPackages.length > 0 ? ["packages"] : []),
    ];

    // Filtered Services from API Categories
    const allServices: (Service & { category?: string })[] = center?.categories?.flatMap(c =>
        (c?.services || []).map(s => ({ ...s, category: c?.name }))
    ) || [];

    const filteredServices =
        activeServiceTab === "all"
            ? allServices
            : activeServiceTab === "packages"
                ? []
                : allServices.filter((s) => s.category === activeServiceTab);

    const handleTogglePackageCart = (pkg: CenterPackage) => {
        if (!pkg) return;
        if (purchasedPackages.some((p) => p?.package_id === pkg.id)) return;
        setSelectedPackageIds((prev) => (prev.includes(pkg.id) ? prev.filter((id) => id !== pkg.id) : [...prev, pkg.id]));
    };

    const fallbackImage =
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop";

    const displayImages = center?.primary_images && center.primary_images.length > 0
        ? center.primary_images
        : [fallbackImage];

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const params = new URLSearchParams(window.location.search);
            const paymentStatus = params.get("payment");
            if (!paymentStatus) return;

            if (paymentStatus === "success") {
                toast.success(t("payment_success"));
            } else if (paymentStatus === "error") {
                toast.error(t("payment_failed"));
            }

            const url = new URL(window.location.href);
            url.searchParams.delete("payment");
            url.searchParams.delete("booking");
            url.searchParams.delete("package");
            window.history.replaceState({}, "", url.pathname + url.search);
        } catch (e) {
            console.error("Error parsing URL parameters", e);
        }
    }, [t]);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = getResumeState();
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as { centerId?: number; selectedServices?: SelectedService[] };
            if (parsed?.centerId !== center?.id) return;
            setPreSelectedServices(parsed?.selectedServices || []);
            setIsBookingMode(true);
        } catch {
            try {
                sessionStorage.removeItem(BOOKING_RESUME_KEY);
            } catch (e) {}
        }
    }, [center?.id]);

    React.useEffect(() => {
        setIsFav(Boolean(center?.is_favorite));
        const token = getAuthToken();
        if (!token) return;

        let cancelled = false;
        void (async () => {
            try {
                const fresh = await fetchCenterById(center.id, token);
                if (!cancelled && !favLock.current && typeof fresh?.is_favorite === "boolean") {
                    setIsFav(fresh.is_favorite);
                }
            } catch (e) {
                console.error("Failed to fetch center by id", e);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [center?.id, center?.is_favorite]);

    const redirectToLogin = () => {
        toast.error(t("login_required"));
        try {
            const redirect = encodeURIComponent(window.location.pathname);
            const parts = window.location.pathname.split("/").filter(Boolean);
            const maybeLocale = parts[0];
            const loginPath = maybeLocale && maybeLocale.length <= 5 ? `/${maybeLocale}/login` : "/login";
            window.location.href = `${loginPath}?redirect=${redirect}`;
        } catch (e) {
            window.location.href = "/login";
        }
    };

    const loadReviews = React.useCallback(async (page: number) => {
        const token = getAuthToken();
        setIsAuthed(Boolean(token));
        if (!token) {
            setReviews([]);
            setMyReview(null);
            setReviewsReady(true);
            return;
        }

        setReviewsLoading(true);
        try {
            const [list, mine] = await Promise.all([
                fetchCenterReviews(token, center.id, page),
                fetchMyCenterReview(token, center.id),
            ]);
            
            if (list) {
                setReviews(list.reviews || []);
                setReviewsAvg(list.avgRating ?? null);
                setReviewsCount(list.reviewsCount ?? 0);
                setReviewsLastPage(list.pagination?.last_page || 1);
            }
            setMyReview(mine || null);
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setReviewsLoading(false);
            setReviewsReady(true);
        }
    }, [center?.id]);

    const handleReviewSubmit = async (payload: { rating: number; comment: string | null }) => {
        const token = getAuthToken();
        if (!token) {
            redirectToLogin();
            return;
        }

        setReviewSubmitting(true);
        try {
            const result = myReview
                ? await updateCenterReview(token, myReview.id, payload)
                : await createCenterReview(token, { center_id: center.id, ...payload });

            if (!result.success) {
                toast.error(result.message || t("review_failed"));
                return;
            }

            toast.success(t("review_saved"));
            await loadReviews(reviewsPage);
        } catch (error) {
            toast.error(t("review_failed"));
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleReviewDelete = async () => {
        const token = getAuthToken();
        if (!token || !myReview) {
            redirectToLogin();
            return;
        }

        setReviewSubmitting(true);
        try {
            const result = await deleteCenterReview(token, myReview.id);

            if (!result.success) {
                toast.error(result.message || t("review_failed"));
                return;
            }

            toast.success(t("review_deleted"));
            await loadReviews(reviewsPage);
        } catch (error) {
            toast.error(t("review_failed"));
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleToggleFav = async () => {
        if (favLock.current) return;
        const token = getAuthToken();
        if (!token) {
            redirectToLogin();
            return;
        }

        const previous = isFav;
        favLock.current = true;
        setIsFav(!previous);
        setFavLoading(true);
        try {
            const result = await toggleCenterFavorite(token, center.id);
            if (!result.success) {
                setIsFav(previous);
                toast.error(result.message || t("favorite_failed"));
                return;
            }

            if (typeof result.isFavorite === "boolean") {
                setIsFav(result.isFavorite);
            }
            toast.success(t("favorite_updated"));
        } catch (e) {
            setIsFav(previous);
            toast.error(t("favorite_failed"));
        } finally {
            favLock.current = false;
            setFavLoading(false);
        }
    };

    const mapTeam = React.useCallback((workers: { id: number; name: string; image: string; branch_name?: string | null }[]) => {
        if (!Array.isArray(workers)) return [];
        return workers.map((worker) => ({
            id: worker.id,
            name: worker.name,
            role: worker.branch_name || t("professional"),
            avatar: worker.image,
        }));
    }, [t]);

    React.useEffect(() => {
        let cancelled = false;
        setTeamLoading(true);
        void (async () => {
            try {
                const result = await fetchCenterWorkers(center.id, 1, 20);
                if (cancelled) return;
                setTeam(mapTeam(result?.workers || []));
                setTeamPage(result?.pagination?.current_page || 1);
                setTeamLastPage(result?.pagination?.last_page || 1);
            } catch (e) {
                console.error("Failed to load team", e);
            } finally {
                if (!cancelled) setTeamLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [center?.id, mapTeam]);

    const loadMoreTeam = async () => {
        if (teamLoading || teamPage >= teamLastPage) return;
        setTeamLoading(true);
        try {
            const result = await fetchCenterWorkers(center.id, teamPage + 1, 20);
            setTeam((prev) => [...prev, ...mapTeam(result?.workers || [])]);
            setTeamPage(result?.pagination?.current_page || teamPage);
            setTeamLastPage(result?.pagination?.last_page || teamLastPage);
        } catch (e) {
            console.error("Failed to load more team", e);
        } finally {
            setTeamLoading(false);
        }
    };

    React.useEffect(() => {
        let cancelled = false;
        void (async () => {
            if (cancelled) return;
            await loadReviews(reviewsPage);
        })();
        return () => {
            cancelled = true;
        };
    }, [loadReviews, reviewsPage]);

    React.useEffect(() => {
        const loadPurchasedPackages = async () => {
            const token = getAuthToken();
            if (!token) {
                setPurchasedPackages([]);
                return;
            }
            try {
                const list = await fetchUserPurchasedPackages(token, center.id);
                setPurchasedPackages(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error("Failed to load purchased packages", e);
                setPurchasedPackages([]);
            }
        };
        void loadPurchasedPackages();
    }, [center?.id]);

    const selectedPackageObjects = centerPackages.filter((pkg) => pkg && selectedPackageIds.includes(pkg.id));

    // Defensive check in case the center prop is invalid
    if (!center) return null;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col">
                {isBookingMode ? (
                    <BookingWizard
                        center={center}
                        onCancel={() => { setIsBookingMode(false); setPreSelectedServices([]); }}
                        initialSelectedServices={preSelectedServices}
                        purchasedPackages={purchasedPackages}
                    />
                ) : isPackageCheckoutMode ? (
                    <Container className="py-6">
                        <PackagePurchaseWizard
                            center={center}
                            selectedPackages={selectedPackageObjects}
                            onBack={() => setIsPackageCheckoutMode(false)}
                            onSuccess={(msg) => {
                                toast.success(msg || t("package_purchase_success"));
                                setIsPackageCheckoutMode(false);
                                setSelectedPackageIds([]);
                                void (async () => {
                                    const token = getAuthToken();
                                    if (!token) return;
                                    try {
                                        const list = await fetchUserPurchasedPackages(token, center.id);
                                        setPurchasedPackages(Array.isArray(list) ? list : []);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                })();
                            }}
                        />
                    </Container>
                ) : (
                    <Container className="py-4">
                        <HeroBase
                            center={center}
                            isFav={isFav}
                            onToggleFav={handleToggleFav}
                        />

                        <Gallery
                            images={displayImages}
                            centerName={center.name}
                            fallbackImage={fallbackImage}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 ">
                            <div className="lg:col-span-2 space-y-10">
                                <Services
                                    services={filteredServices}
                                    packages={centerPackages}
                                    activeTab={activeServiceTab}
                                    onTabChange={setActiveServiceTab}
                                    tabs={categoryTabs}
                                    onBookNow={handleBookNow}
                                    onTogglePackageCart={handleTogglePackageCart}
                                    onStartPackageCheckout={() => setIsPackageCheckoutMode(true)}
                                    selectedPackageIds={selectedPackageIds}
                                    purchasedPackageIds={purchasedPackages.map((p) => p?.package_id).filter(Boolean)}
                                />

                                <About centerName={center.name} />

                                {(teamLoading || team.length > 0) && (
                                    <Team
                                        team={team}
                                        hasMore={teamPage < teamLastPage}
                                        loading={teamLoading}
                                        onLoadMore={loadMoreTeam}
                                    />
                                )}

                                <Reviews
                                    reviews={reviews}
                                    avgRating={reviewsAvg}
                                    reviewsCount={reviewsCount}
                                    myReview={myReview}
                                    isAuthenticated={isAuthed}
                                    loading={reviewsLoading}
                                    ready={reviewsReady}
                                    submitting={reviewSubmitting}
                                    page={reviewsPage}
                                    lastPage={reviewsLastPage}
                                    onPageChange={setReviewsPage}
                                    onRequireLogin={redirectToLogin}
                                    onSubmit={handleReviewSubmit}
                                    onDelete={handleReviewDelete}
                                />
                            </div>

                            <Sidebar
                                center={center}
                                fallbackImage={fallbackImage}
                                onBookNow={handleBookNow}
                                isFav={isFav}
                                onToggleFav={handleToggleFav}
                                favLoading={favLoading}
                            />
                        </div>
                    </Container>
                )}
            </main>
        </div>
    );
}