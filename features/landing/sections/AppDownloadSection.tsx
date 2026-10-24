"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

const AppDownloadSection: React.FC = () => {
    const t = useTranslations();

    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.7,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className="relative w-full py-16 sm:py-24 overflow-hidden bg-[#f8f5f0]"
        >
            {/* Full Section Background Image */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <Image
                    src="/appdownload/Background.png"
                    alt="Background"
                    fill
                    className="object-cover object-center"
                    priority
                    unoptimized 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f8f5f0] via-[#f8f5f0]/80 to-transparent"></div>
            </div>

            <Container className="relative z-10">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    
                    {/* Left content */}
                    <div className="flex flex-col items-start px-4 lg:px-0">
                        {/* Overline Text */}
                        <span className="mb-4 text-sm font-semibold tracking-widest text-[#C29A5C] uppercase">
                            {t('app_download_overline')}
                        </span>

                        {/* Main Heading */}
                        <h2 className="text-4xl font-normal tracking-tight text-[#0E3D35] sm:text-5xl lg:text-6xl max-w-lg leading-[1.1] font-serif">
                            {t('app_download_heading_1')}<br />
                            {t('app_download_heading_2')}<br />
                            {t('app_download_heading_3')}
                        </h2>

                        {/* Subtitle */}
                        <p className="mt-6 max-w-md text-lg text-[#4A5D5A] font-medium leading-relaxed">
                            {t('app_download_subtitle')}
                        </p>

                        {/* App Store Buttons */}
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            {/* Apple App Store Button */}
                            <Link 
                                href="https://apps.apple.com/ae/app/luzori-customer/id6793425715" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-[#0B3B35] hover:bg-[#154A44] text-white px-5 py-3 rounded-xl transition-colors duration-300 shadow-md"
                            >
                                <svg viewBox="0 0 384 512" className="w-7 h-7 fill-current">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                </svg>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] font-medium">{t('app_download_apple_top')}</span>
                                    <span className="text-sm font-bold">{t('app_download_apple_bottom')}</span>
                                </div>
                            </Link>

                            {/* Google Play Button */}
                            <Link 
                                href="https://play.google.com/store/apps/details?id=com.luzori.etechnocode&pcampaignid=web_share" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-[#0B3B35] hover:bg-[#154A44] text-white px-5 py-3 rounded-xl transition-colors duration-300 shadow-md"
                            >
                                <svg viewBox="0 0 512 512" className="w-7 h-7 fill-current">
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                                </svg>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[10px] font-medium">{t('app_download_google_top')}</span>
                                    <span className="text-sm font-bold">{t('app_download_google_bottom')}</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Right — App Image with Soft Mask Blend */}
                    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="relative w-full max-w-md lg:max-w-none lg:w-[130%] h-full"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
                                maskComposite: 'intersect',
                                WebkitMaskComposite: 'source-in', 
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                            }}
                        >
                            <Image
                                src="/appdownload/luzoriApp.png"
                                alt="Luzori App Screens"
                                fill
                                className="object-contain object-right drop-shadow-2xl"
                                priority
                                unoptimized 
                            />
                        </motion.div>
                    </div>
                    
                </div>
            </Container>
        </motion.section>
    );
};

export default AppDownloadSection;