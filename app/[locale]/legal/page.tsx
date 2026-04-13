"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import { useTranslations, useLocale } from "next-intl";
import { fetchInfo } from "@/lib/api";
import { InfoData } from "@/lib/apiEndpoints";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

type TabType = "privacy_policy" | "terms_of_use" | "terms_of_service";

export default function LegalPage() {
    const t = useTranslations();
    const locale = useLocale() as "en" | "ar";
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [info, setInfo] = useState<InfoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("terms_of_use");

    useEffect(() => {
        const loadInfo = async () => {
            const data = await fetchInfo();
            if (data) {
                setInfo(data);
            }
            setLoading(false);
        };
        loadInfo();
    }, []);

    useEffect(() => {
        const tabParam = searchParams.get("tab") as TabType;
        if (tabParam && ["privacy_policy", "terms_of_use", "terms_of_service"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const tabs = [
        { id: "terms_of_use", label: t('terms_of_use') || "Terms of use" },
        { id: "privacy_policy", label: t('privacy_policy') || "Privacy policy" },
        { id: "terms_of_service", label: t('terms_of_service') || "Terms of service" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const content = info ? info[activeTab][locale] : "";

    return (
        <main className="min-h-screen bg-white pt-24 pb-20">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-12">
                        {t('legal') || "Legal"}
                    </h1>

                    {/* Tabs Area */}
                    <div className="relative border-b border-gray-100 mb-12 overflow-x-auto no-scrollbar">
                        <div className="flex gap-8 min-w-max pb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as TabType);
                                        router.replace(`?tab=${tab.id}`, { scroll: false });
                                    }}
                                    className={cn(
                                        "relative py-2 text-sm font-bold transition-all",
                                        activeTab === tab.id 
                                            ? "text-gray-900" 
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-[-17px] left-0 right-0 h-1 bg-gray-900 rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="prose prose-gray max-w-none"
                        >
                            <div 
                                className="text-lg leading-relaxed text-gray-700"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Container>
        </main>
    );
}
