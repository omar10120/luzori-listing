"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

const BusinessSection: React.FC = () => {
    const t = useTranslations();

    const dashboardLabels = [
        { key: 'appointments', label: "Appointments" }, // Fixed labels for mockup
        { key: 'revenue', label: "Revenue" },
        { key: 'clients', label: "Clients" }
    ];

    return (
        <section className="bg-gray-50 py-16 sm:py-24">
            <Container>
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Left content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {t('luzori_for_business')}
                        </h2>
                        <p className="mt-4 max-w-md text-base text-gray-500 sm:text-lg">
                            {t('business_subtitle')}
                        </p>
                        <div className="mt-6">
                            <Button size="lg">{t('discover_more')}</Button>
                        </div>

                        {/* Rating badge */}
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-100">
                            <Star size={16} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-gray-900">
                                {t('excellent_rating')}
                            </span>
                        </div>
                    </motion.div>

                    {/* Right — dashboard mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="flex justify-center"
                    >
                        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
                            {/* Mock header */}
                            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                                <div className="h-3 w-3 rounded-full bg-red-300" />
                                <div className="h-3 w-3 rounded-full bg-amber-300" />
                                <div className="h-3 w-3 rounded-full bg-emerald-300" />
                                <div className="ml-3 h-4 w-40 rounded bg-gray-100" />
                            </div>

                            {/* Mock dashboard content */}
                            <div className="space-y-4 p-5">
                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {dashboardLabels.map((item) => (
                                        <div
                                            key={item.key}
                                            className="rounded-xl bg-gray-50 p-3 text-center"
                                        >
                                            <div className="text-lg font-bold text-gray-900">
                                                {item.key === "revenue"
                                                    ? "$4.2k"
                                                    : item.key === "clients"
                                                        ? "86"
                                                        : "142"}
                                            </div>
                                            <div className="text-[10px] text-gray-500">{item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Graph placeholder */}
                                <div className="flex h-32 items-end gap-1.5 rounded-xl bg-gray-50 p-4">
                                    {[40, 65, 50, 80, 70, 90, 60, 75, 85, 55, 70, 95].map(
                                        (h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-t bg-gradient-to-t from-purple-400 to-purple-200"
                                                style={{ height: `${h}%` }}
                                            />
                                        )
                                    )}
                                </div>

                                {/* Recent bookings mock */}
                                <div className="space-y-2">
                                    {[1, 2, 3].map((n) => (
                                        <div
                                            key={n}
                                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100" />
                                            <div className="flex-1 space-y-1">
                                                <div className="h-3 w-24 rounded bg-gray-200" />
                                                <div className="h-2 w-16 rounded bg-gray-100" />
                                            </div>
                                            <div className="h-6 w-16 rounded-full bg-emerald-50" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};

export default BusinessSection;
