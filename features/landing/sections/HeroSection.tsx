"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Clock, ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";




const HeroSection: React.FC = () => {
    const t = useTranslations();
    return (
        <section className="bg-transparent py-16 sm:py-24 overflow-hidden">
            {/* Soft gradient blobs */}
            <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-pink-200/30 blur-3xl" />

            <Container className="relative z-10 text-center">
                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
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
                    className="mx-auto mt-8 flex max-w-2xl flex-col items-stretch gap-3 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-gray-100 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5"
                >
                    {/* Treatment */}
                    <div className="flex flex-1 items-center gap-2 px-4 py-2">
                        <Search size={18} className="shrink-0 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('treatment_placeholder')}
                            aria-label="Treatment or venue"
                            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                        />
                    </div>

                    <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                    {/* Location */}
                    <div className="flex flex-1 items-center gap-2 px-4 py-2">
                        <MapPin size={18} className="shrink-0 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('treatment_placeholder')}
                            aria-label="Location"
                            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                        />
                    </div>

                    <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                    {/* Time */}
                    <div className="flex flex-1 items-center gap-2 px-4 py-2">
                        <Clock size={18} className="shrink-0 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('treatment_placeholder')}
                            aria-label="Preferred time"
                            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                        />
                    </div>

                    {/* Search button */}
                    <Button
                        size="lg"
                        className="shrink-0 rounded-full sm:ml-1"
                        aria-label={t('treatment_placeholder')}
                    >
                        {t('search')}
                    </Button>
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
