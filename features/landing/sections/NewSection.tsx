"use client";

import React from "react";
import BusinessCardScroll from "./BusinessCardScroll";
import { newBusinesses } from "@/data/mockData";
import { NEW_HEADING } from "@/lib/constants";

const NewSection: React.FC = () => {
    return (
        <BusinessCardScroll
            heading={NEW_HEADING}
            businesses={newBusinesses}
        />
    );
};

export default NewSection;
