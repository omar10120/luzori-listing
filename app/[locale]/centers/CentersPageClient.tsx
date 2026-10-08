"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/CardByRate";
import { fetchCenters } from "@/lib/api";
import type { Business, CenterRate } from "@/lib/types";

export default function CentersPageClient() {
    const searchParams = useSearchParams();
    const rate = searchParams.get("rate");
    const t = useTranslations();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchCenters((rate || "") as CenterRate);
                if (!cancelled) {
                    setBusinesses(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [rate]);

    const getHeading = () => {
        if (rate === "recommended") return t("recommended");
        if (rate === "trending") return t("trending");
        if (rate === "new_to") return t("new_to_luzori");
        return t("centers") || "Centers";
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] pb-16 pt-8">
            <Container>
                <div className="mb-8">
                    <SectionHeader heading={getHeading()} className="mb-0 text-gray-900" />
                </div>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-100">
                        <p className="text-gray-500">{t("search_no_results") || "No centers found."}</p>
                    </div>
                ) : (
                    // Find this section in your CentersPageClient component
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {businesses.map((biz) => (
                            <div key={biz.id} className="min-w-0 h-full">
                                <Card business={biz} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}
