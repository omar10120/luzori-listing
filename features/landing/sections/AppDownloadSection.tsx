"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import Container from "@/components/ui/Container";
import { APP_DOWNLOAD_HEADING, APP_DOWNLOAD_SUBTITLE } from "@/lib/constants";

const AppDownloadSection: React.FC = () => {
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
                        {/* App store icons */}
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                                <Smartphone size={16} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                                Available on iOS &amp; Android
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {APP_DOWNLOAD_HEADING}
                        </h2>
                        <p className="mt-4 max-w-md text-base text-gray-500 sm:text-lg">
                            {APP_DOWNLOAD_SUBTITLE}
                        </p>

                        {/* QR placeholder */}
                        <div className="mt-8 flex items-center gap-6">
                            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white">
                                <span className="text-xs text-gray-400">QR Code</span>
                            </div>

                            {/* Store badges */}
                            <div className="flex flex-col gap-3">
                                <div className="flex h-11 w-36 items-center justify-center rounded-lg bg-gray-900 px-3">
                                    <span className="text-xs font-medium text-white">
                                        App Store
                                    </span>
                                </div>
                                <div className="flex h-11 w-36 items-center justify-center rounded-lg bg-gray-900 px-3">
                                    <span className="text-xs font-medium text-white">
                                        Google Play
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right — phone mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="flex justify-center"
                    >
                        <div className="relative w-64 sm:w-72">
                            {/* Phone frame */}
                            <div className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-gray-900 bg-white shadow-2xl">
                                {/* Status bar */}
                                <div className="flex items-center justify-between bg-gray-900 px-6 py-2">
                                    <span className="text-[10px] text-gray-400">9:41</span>
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 rounded-full bg-gray-600" />
                                        <div className="h-2 w-2 rounded-full bg-gray-600" />
                                        <div className="h-2 w-2 rounded-full bg-gray-600" />
                                    </div>
                                </div>

                                {/* Screen content mock */}
                                <div className="space-y-3 p-4">
                                    <div className="h-6 w-24 rounded bg-gray-100" />
                                    <div className="h-4 w-full rounded bg-gray-50" />
                                    <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-purple-100 to-pink-100" />
                                    <div className="flex gap-2">
                                        <div className="h-3 w-16 rounded bg-gray-100" />
                                        <div className="h-3 w-12 rounded bg-gray-100" />
                                    </div>
                                    <div className="h-10 w-full rounded-xl bg-gray-900" />
                                    <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-blue-50 to-purple-50" />
                                    <div className="flex gap-2">
                                        <div className="h-3 w-20 rounded bg-gray-100" />
                                        <div className="h-3 w-10 rounded bg-gray-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};

export default AppDownloadSection;
