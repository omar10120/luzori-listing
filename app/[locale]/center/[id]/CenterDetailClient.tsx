"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import type { CenterDetailData, Service, Category } from "@/lib/apiEndpoints";

import Header from '@/features/center-details/sections/Header';
import HeroBase from '@/features/center-details/sections/HeroBase';
import Gallery from '@/features/center-details/sections/Gallery';
import Services from '@/features/center-details/sections/Services';
import About from '@/features/center-details/sections/About';
import Team from '@/features/center-details/sections/Team';
import Reviews from '@/features/center-details/sections/Reviews';
import Sidebar from '@/features/center-details/sections/Sidebar';

/* ─── Mock Data for sections not in API (if still needed) ────────── */

const MOCK_TEAM = [
    { id: 1, name: "Sarah", role: "Senior Stylist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
    { id: 2, name: "Nadia", role: "Colorist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: 3, name: "Layla", role: "Nail Tech", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
    { id: 4, name: "Amira", role: "Therapist", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
];

const MOCK_REVIEWS = [
    { id: 1, author: "Fatima K.", rating: 5, text: "Amazing experience! The staff was so professional and the results exceeded my expectations.", date: "2 days ago" },
    { id: 2, author: "Mariam S.", rating: 4, text: "Loved the atmosphere and quality of service. Will definitely come back for more treatments.", date: "1 week ago" },
    { id: 3, author: "Noura A.", rating: 5, text: "Best salon in town! The attention to detail is incredible. Highly recommend the bridal package.", date: "2 weeks ago" },
];

/* ─── Main Component ─────────────────────────────────────────────── */

interface Props {
    center: CenterDetailData;
}

export default function CenterDetailClient({ center }: Props) {
    const [activeServiceTab, setActiveServiceTab] = useState("all");
    const [isFav, setIsFav] = useState(false);

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

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                            <Services
                                services={filteredServices}
                                activeTab={activeServiceTab}
                                onTabChange={setActiveServiceTab}
                                tabs={categoryTabs}
                            />

                            <About centerName={center.name} />

                            <Team team={MOCK_TEAM} />

                            <Reviews reviews={MOCK_REVIEWS} />
                        </div>

                        <Sidebar center={center} fallbackImage={fallbackImage} />
                    </div>
                </Container>
            </main>
        </div>
    );
}