"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import type { CenterDetailData, Service } from "@/lib/apiEndpoints";
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
import { useTranslations } from "next-intl";

/* ─── Main Component ─────────────────────────────────────────────── */

interface Props {
    center: CenterDetailData;
}

export default function CenterDetailClient({ center }: Props) {
    const t = useTranslations();
    const [activeServiceTab, setActiveServiceTab] = useState("all");
    const [isFav, setIsFav] = useState(false);
    const [isBookingMode, setIsBookingMode] = useState(false);
    const [preSelectedServices, setPreSelectedServices] = useState<SelectedService[]>([]);

    const handleBookNow = (service?: Service & { category?: string }) => {
        if (service) {
            setPreSelectedServices([{ ...service, categoryName: service.category }]);
        } else {
            setPreSelectedServices([]);
        }
        setIsBookingMode(true);
    };

    // Derived Tabs from API
    const categoryTabs = ["all", ...(center.categories?.map(c => c.name) || [])];

    // Filtered Services from API Categories
    const allServices: (Service & { category?: string })[] = center.categories?.flatMap(c =>
        c.services.map(s => ({ ...s, category: c.name }))
    ) || [];

    const filteredServices =
        activeServiceTab === "all"
            ? allServices
            : allServices.filter((s) => s.category === activeServiceTab);

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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col">
                {isBookingMode ? (
                    <BookingWizard
                        center={center}
                        onCancel={() => { setIsBookingMode(false); setPreSelectedServices([]); }}
                        initialSelectedServices={preSelectedServices}
                    />
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
                                    activeTab={activeServiceTab}
                                    onTabChange={setActiveServiceTab}
                                    tabs={categoryTabs}
                                    onBookNow={handleBookNow}
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