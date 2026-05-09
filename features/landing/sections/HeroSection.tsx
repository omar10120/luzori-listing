"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import LandingSearchBar from "@/components/search/LandingSearchBar";
import { useTranslations } from "next-intl";




const HeroSection: React.FC = () => {
    const t = useTranslations();
    return (
        <section className=" py-16 sm:py-24 overflow-hidden">
            {/* Soft gradient blobs */}
            <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] rounded-full bg-purple-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-40 top-20 h-[400px] rounded-full bg-pink-200/30 blur-3xl" />

            <Container className="relative z-10 text-center">
                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-3xl text-xl font-bold tracking-tight text-gray-900 sm:text-xl lg:text-5xl"
                >
                    {t('hero_heading')}
                </motion.h1>    

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg"
                >
                    {t('hero_subtitle')}
                </motion.p>

                {/* Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mx-auto mt-8 max-w-4xl"
                >
                    <LandingSearchBar variant="hero" />
                </motion.div>

                {/* Stats + CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6"
                >
                    <p className="text-sm text-gray-500">{t('hero_stats_text')}</p>
                    <button
                        type="button"
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 transition-colors hover:text-purple-600"
                    >
                        {t('hero_app_cta')}
                        <ChevronDown size={14} className="transition-transform group-hover:translate-y-0.5" />
                    </button>
                </motion.div>
            </Container>
        </section>
    );
};

export default HeroSection;
