"use client";

import React, { useState, useEffect } from "react";
import BusinessCardScroll from "./BusinessCardScroll";
import { fetchCenters } from "@/lib/api";
import { Business } from "@/lib/types";
import { useTranslations } from "next-intl";

const TrendingSection: React.FC = () => {
    const t = useTranslations();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const getCenters = async () => {
            try {
                const data = await fetchCenters("trending");
                setBusinesses(data);
            } catch (error) {
                console.error("TrendingSection Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getCenters();
    }, []);

    if (isLoading && businesses.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-pulse h-10 w-48 bg-gray-100 rounded-full" />
            </div>
        );
    }

    return (
        <BusinessCardScroll
            heading={t('trending')}
            businesses={businesses}
        />
    );
};

export default TrendingSection;