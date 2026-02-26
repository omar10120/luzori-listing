"use client";

import React from "react";
import BusinessCardScroll from "./BusinessCardScroll";
import { recommendedBusinesses } from "@/data/mockData";
import { RECOMMENDED_HEADING } from "@/lib/constants";

const RecommendedSection: React.FC = () => {
    return (
        <BusinessCardScroll
            heading={RECOMMENDED_HEADING}
            businesses={recommendedBusinesses}
        />
    );
};

export default RecommendedSection;
