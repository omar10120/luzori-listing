"use client";

import React, { useState, useEffect } from "react";
import BusinessCardScroll from "./BusinessCardScroll";
import { NEW_HEADING } from "@/lib/constants";
import { fetchCenters } from "@/lib/api";
import { Business } from "@/lib/types";

const NewSection: React.FC = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const getCenters = async () => {
            try {
                const data = await fetchCenters("new_to");
                console.log(data);
                setBusinesses(data);
            } catch (error) {
                console.error("NewSection Error:", error);
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
            heading={NEW_HEADING}
            businesses={businesses}
        />
    );
};

export default NewSection;
