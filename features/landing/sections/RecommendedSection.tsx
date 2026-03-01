"use client";

import React, { useState, useEffect } from "react";
import BusinessCardScroll from "./BusinessCardScroll";
import { RECOMMENDED_HEADING } from "@/lib/constants";
import { fetchCenters } from "@/lib/api";
import { Business } from "@/lib/types";

const RecommendedSection: React.FC = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const getCenters = async () => {
            try {
                const data = await fetchCenters("recommended");
                setBusinesses(data);
            } catch (error) {
                console.error("RecommendedSection Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getCenters();
    }, []);

    // Optionally handle empty/loading states
    if (isLoading && businesses.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-pulse h-10 w-48 bg-gray-100 rounded-full" />
            </div>
        );
    }

    return (
        <BusinessCardScroll
            heading={RECOMMENDED_HEADING}
            businesses={businesses}
        />
    );
};

export default RecommendedSection;
