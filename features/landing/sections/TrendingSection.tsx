"use client";

import React from "react";
import BusinessCardScroll from "./BusinessCardScroll";
import { trendingBusinesses } from "@/data/mockData";
import { TRENDING_HEADING } from "@/lib/constants";

const TrendingSection: React.FC = () => {
    return (
        <BusinessCardScroll
            heading={TRENDING_HEADING}
            businesses={trendingBusinesses}
        />
    );
};

export default TrendingSection;
