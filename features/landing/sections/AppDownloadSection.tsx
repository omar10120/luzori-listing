"use client";

import React from "react";
import { motion } from "framer-motion";
import { Apple } from "lucide-react";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";
import { SITE_NAME } from "@/lib/constants";

const AppDownloadSection: React.FC = () => {
    const t = useTranslations();
    // QR Code for https://play.google.com/
    const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://play.google.com/&color=111827";

    return (
        <section className="bg-white py-16 sm:py-24 overflow-hidden">
            <Container>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-start"
                    >
                        {/* Store Logos / Available on */}
                        <div className="mb-6 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Available on</span>
                            <div className="flex items-center gap-3">
                                <Apple size={20} className="text-gray-900 fill-current" />
                                <svg className="h-5 w-5 fill-current text-gray-900" viewBox="0 0 24 24">
                                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.23 2.23 0 0 1-.41-.716V2.53c0-.263.14-.515.41-.716zm11.597 11.196l2.13-2.13c.456-.456.456-1.194 0-1.65l-2.13-2.13-2.588 2.588 2.588 2.588h.001zm-3.83-1.428L1.48 2.067C1.04 1.81 0 2.128 0 2.92v18.16c0 .792 1.04 1.11 1.48.853l9.896-9.518-2.588-2.588h-.001-.001zm11.238-3.048l-3.326-1.92-3.13 3.13 3.13 3.13 3.326-1.92c.692-.4 1.088-1.046 1.088-1.71s-.396-1.31-1.088-1.71z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-2xl lg:text-4xl max-w-lg leading-[1.1]">
                            {t('download_app_heading')}
                        </h2>
                        <p className="mt-6 max-w-md text-lg text-gray-600 font-medium">
                            {t('download_app_subtitle')}
                        </p>

                        {/* QR Code Card */}
                        <div className="mt-10 p-4 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-gray-100 group transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.12)]">
                            <img
                                src={qrCodeUrl}
                                alt="Scan to download app"
                                className="w-20 h-20 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </motion.div>

                    {/* Right — Dual Phone Mockups */}
                    <div className="relative flex justify-center lg:justify-end h-[500px] sm:h-[600px]">
                        {/* Main Phone (Left) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute z-20 left-0 lg:-left-20 top-0 w-64 sm:w-80"
                        >
                            <div className="relative overflow-hidden rounded-[2.8rem] border-[8px] border-gray-900 bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] ring-1 ring-gray-900/5 aspect-[9/18.5]">
                                {/* UI Mockup */}
                                <img
                                    src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover"
                                    alt="App Screenshot 1"
                                />
                                {/* Bottom Bar Mockup */}
                                <div className="absolute bottom-0 inset-x-0 h-16 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex items-center justify-around px-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center -mt-8 border-4 border-white shadow-lg">
                                        <div className="w-4 h-4 bg-white rounded-sm" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Secondary Phone (Right) */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 30 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="absolute z-10 right-0 top-10 w-56 sm:w-72 group"
                        >
                            <div className="relative overflow-hidden rounded-[2.5rem] border-[7px] border-gray-900 bg-white shadow-[0_20px_40px_-8px_rgba(0,0,0,0.15)] ring-1 ring-gray-900/5 aspect-[9/18.5]">
                                <img
                                    src="https://images.unsplash.com/photo-1512428559083-a40ce503367d?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt="App Screenshot 2"
                                />
                                {/* Play Overlay to simulate video/gif content */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                                    <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl transition-transform group-hover:scale-110">
                                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default AppDownloadSection;