"use client";

import React, { useState } from "react";
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
import { fetchUserPurchasedPackages } from "@/lib/api";
import toast from "react-hot-toast";

const BOOKING_RESUME_KEY = "luzori_booking_resume_state";

/* ─── Main Component ─────────────────────────────────────────────── */

interface Props {
    center: CenterDetailData;
}

export default function CenterDetailClient({ center }: Props) {
    const t = useTranslations();
    const [activeServiceTab, setActiveServiceTab] = useState("all");
    const [isFav, setIsFav] = useState(false);
    const [isBookingMode, setIsBookingMode] = useState(false);
    const [isPackageCheckoutMode, setIsPackageCheckoutMode] = useState(false);
    const [preSelectedServices, setPreSelectedServices] = useState<SelectedService[]>([]);
    const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
    const [purchasedPackages, setPurchasedPackages] = useState<UserPurchasedPackage[]>([]);

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
    const mockTeam = [
        { id: 1, name: "Sarah", role: t("center_team_role_senior_stylist"), avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
        { id: 2, name: "Nadia", role: t("center_team_role_colorist"), avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
        { id: 3, name: "Layla", role: t("center_team_role_nail_tech"), avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
        { id: 4, name: "Amira", role: t("center_team_role_therapist"), avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
    ];
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
                            onToggleFav={() => setIsFav(!isFav)}
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

                                <Team team={mockTeam} />

                                <Reviews reviews={mockReviews} />
                            </div>

                            <Sidebar center={center} fallbackImage={fallbackImage} onBookNow={handleBookNow} />
                        </div>
                    </Container>

                )}

            </main>
        </div>
    );
}