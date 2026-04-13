"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { cityGroups } from "@/data/mockData";
import { useTranslations } from "next-intl";
import type { CityGroup } from "@/lib/types";

interface LinkGroupProps {
    group: CityGroup;
    getTranslatedLocation: (name: string, type: "country" | "city") => string;
}

const toLocationKey = (name: string) =>
    name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

const LinkGroup: React.FC<LinkGroupProps> = ({ group, getTranslatedLocation }) => {
    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {getTranslatedLocation(group.country, "country")}
            </h3>
            <ul className="space-y-1.5">
                {group.cities.map((city) => (
                    <li key={city}>
                        <a
                            href="#"
                            className="text-sm text-gray-900 transition-colors hover:text-gray-900"
                        >
                            {getTranslatedLocation(city, "city")}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const BrowseCitySection: React.FC = () => {
    const t = useTranslations();
    const getTranslatedLocation = (name: string, type: "country" | "city"): string => {
        const key = `${type}_${toLocationKey(name)}`;
        return t.has(key) ? t(key) : name;
    };

    return (
        <section className="border-t border-gray-100 py-16 sm:py-24">
            <Container>
                <SectionHeader heading={t('browse_by_city')} />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6"
                >
                    {cityGroups.map((group) => (
                        <LinkGroup
                            key={group.country}
                            group={group}
                            getTranslatedLocation={getTranslatedLocation}
                        />
                    ))}
                </motion.div>
            </Container>
        </section>
    );
};

export default BrowseCitySection;