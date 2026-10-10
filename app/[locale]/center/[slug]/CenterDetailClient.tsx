"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import type { CenterDetailData, CenterPackage, Service, UserPurchasedPackage } from "@/lib/apiEndpoints";
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
import { fetchCenterById, fetchCenterWorkers, fetchUserPurchasedPackages, toggleCenterFavorite } from "@/lib/api";
import toast from "react-hot-toast";




const BOOKING_RESUME_KEY = "luzori_booking_resume_state";

/* ─── Main Component ─────────────────────────────────────────────── */

interface Props {
    center: CenterDetailData;
}

export default function CenterDetailClient({ center }: Props) {
    const t = useTranslations();
    const [activeServiceTab, setActiveServiceTab] = useState("all");
    const [isFav, setIsFav] = useState(Boolean(center.is_favorite));
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

    const handleBookNow = (service?: Service & { category?: string }) => {
        if (service) {
            setPreSelectedServices([{ ...service, categoryName: service.category }]);
        } else {
            setPreSelectedServices([]);
        }
        setIsBookingMode(true);
    };

    // Derived Tabs from API
    const centerPackages = center.packages || [];
    const categoryTabs = [
        "all",
        ...(center.categories?.map(c => c.name) || []),
        ...(centerPackages.length > 0 ? ["packages"] : []),
    ];

    // Filtered Services from API Categories
    const allServices: (Service & { category?: string })[] = center.categories?.flatMap(c =>
        c.services.map(s => ({ ...s, category: c.name }))
    ) || [];

    const filteredServices =
        activeServiceTab === "all"
            ? allServices
            : activeServiceTab === "packages"
                ? []
                : allServices.filter((s) => s.category === activeServiceTab);

    const handleTogglePackageCart = (pkg: CenterPackage) => {
        if (purchasedPackages.some((p) => p.package_id === pkg.id)) return;
        setSelectedPackageIds((prev) => (prev.includes(pkg.id) ? prev.filter((id) => id !== pkg.id) : [...prev, pkg.id]));
    };

    const fallbackImage =
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop";

    const displayImages = center.primary_images && center.primary_images.length > 0
        ? center.primary_images
        : [fallbackImage];
    const mockReviews = [
        {
            id: 1,
            author: "Fatima K.",
            rating: 5,
            text: t("center_review_1_text"),
            date: t("center_review_1_date"),
        },
        {
            id: 2,
            author: "Mariam S.",
            rating: 4,
            text: t("center_review_2_text"),
            date: t("center_review_2_date"),
        },
        {
            id: 3,
            author: "Noura A.",
            rating: 5,
            text: t("center_review_3_text"),
            date: t("center_review_3_date"),
        },
    ];

    useEffect(() => {
        if (typeof window === "undefined") return;
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
    }, [t]);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = sessionStorage.getItem(BOOKING_RESUME_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as { centerId?: number; selectedServices?: SelectedService[] };
            if (parsed.centerId !== center.id) return;
            setPreSelectedServices(parsed.selectedServices || []);
            setIsBookingMode(true);
        } catch {
            sessionStorage.removeItem(BOOKING_RESUME_KEY);
        }
    }, [center.id]);

    React.useEffect(() => {
        setIsFav(Boolean(center.is_favorite));
        const token = localStorage.getItem("authToken");
        if (!token) return;

        let cancelled = false;
        void (async () => {
            const fresh = await fetchCenterById(center.id, token);
            if (!cancelled && !favLock.current && typeof fresh?.is_favorite === "boolean") {
                setIsFav(fresh.is_favorite);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [center.id, center.is_favorite]);

    const handleToggleFav = async () => {
        if (favLock.current) return;
        const token = localStorage.getItem("authToken");
        if (!token) {
            toast.error(t("login_required"));
            const redirect = encodeURIComponent(window.location.pathname);
            const parts = window.location.pathname.split("/").filter(Boolean);
            const maybeLocale = parts[0];
            const loginPath = maybeLocale && maybeLocale.length <= 5 ? `/${maybeLocale}/login` : "/login";
            window.location.href = `${loginPath}?redirect=${redirect}`;
            return;
        }

        const previous = isFav;
        favLock.current = true;
        setIsFav(!previous);
        setFavLoading(true);
        const result = await toggleCenterFavorite(token, center.id);
        favLock.current = false;
        setFavLoading(false);

        if (!result.success) {
            setIsFav(previous);
            toast.error(result.message || t("favorite_failed"));
            return;
        }

        if (typeof result.isFavorite === "boolean") {
            setIsFav(result.isFavorite);
        }
        toast.success(t("favorite_updated"));
    };

    const mapTeam = React.useCallback((workers: { id: number; name: string; image: string; branch_name?: string | null }[]) => {
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
            const result = await fetchCenterWorkers(center.id, 1, 20);
            if (cancelled) return;
            setTeam(mapTeam(result.workers));
            setTeamPage(result.pagination.current_page);
            setTeamLastPage(result.pagination.last_page);
            setTeamLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [center.id, mapTeam]);

    const loadMoreTeam = async () => {
        if (teamLoading || teamPage >= teamLastPage) return;
        setTeamLoading(true);
        const result = await fetchCenterWorkers(center.id, teamPage + 1, 20);
        setTeam((prev) => [...prev, ...mapTeam(result.workers)]);
        setTeamPage(result.pagination.current_page);
        setTeamLastPage(result.pagination.last_page);
        setTeamLoading(false);
    };

    React.useEffect(() => {
        const loadPurchasedPackages = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setPurchasedPackages([]);
                return;
            }
            const list = await fetchUserPurchasedPackages(token, center.id);
            setPurchasedPackages(list);
        };
        void loadPurchasedPackages();
    }, [center.id]);

    const selectedPackageObjects = centerPackages.filter((pkg) => selectedPackageIds.includes(pkg.id));

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
                                    const token = localStorage.getItem("authToken");
                                    if (!token) return;
                                    const list = await fetchUserPurchasedPackages(token, center.id);
                                    setPurchasedPackages(list);
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
                                    purchasedPackageIds={purchasedPackages.map((p) => p.package_id)}
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

                                <Reviews reviews={mockReviews} />
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