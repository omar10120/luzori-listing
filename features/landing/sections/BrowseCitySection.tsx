"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { cityGroups } from "@/data/mockData";
import { BROWSE_CITY_HEADING } from "@/lib/constants";
import type { CityGroup } from "@/lib/types";

interface LinkGroupProps {
    group: CityGroup;
}

const LinkGroup: React.FC<LinkGroupProps> = ({ group }) => {
    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {group.country}
            </h3>
            <ul className="space-y-1.5">
                {group.cities.map((city) => (
                    <li key={city}>
                        <a
                            href="#"
                            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                        >
                            {city}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const BrowseCitySection: React.FC = () => {
    return (
        <section className="border-t border-gray-100 py-16 sm:py-24">
            <Container>
                <SectionHeader heading={BROWSE_CITY_HEADING} />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6"
                >
                    {cityGroups.map((group) => (
                        <LinkGroup key={group.country} group={group} />
                    ))}
                </motion.div>
            </Container>
        </section>
    );
};

export default BrowseCitySection;
