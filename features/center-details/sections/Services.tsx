import React from 'react';
import { Scissors, Sparkles, Users, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Button from '@/components/ui/Button';

import { Service } from '@/lib/apiEndpoints';

interface ServicesProps {
    services: (Service & { category?: string })[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: string[];
}

export default function Services({ services, activeTab, onTabChange, tabs }: ServicesProps) {
    const t = useTranslations();

    return (
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('services')}</h2>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6 border-b border-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={cn(
                            "whitespace-nowrap px-4 py-2 text-sm font-semibold transition-all relative",
                            activeTab === tab
                                ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900"
                                : "text-gray-500 hover:text-gray-700 uppercase"
                        )}
                    >
                        {tab === "all" ? t('all') : tab}
                    </button>
                ))}
            </div>

            {/* Service list */}
            <div className="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                {services.map((svc) => (
                    <div
                        key={svc.id}
                        className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
                    >

                        <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Service Image or Category Icon */}
                            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shrink-0 shadow-sm transition-transform group-hover:scale-105  ">
                                {svc.image && !svc.image.includes('avatars/1.png') ? (

                                    <Image
                                        src={svc.image}
                                        alt={svc.name}
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        {svc.category?.toLowerCase() === "hair" && <Scissors size={24} />}
                                        {svc.category?.toLowerCase() === "skin" && <Sparkles size={24} />}
                                        {svc.category?.toLowerCase() === "body" && <Users size={24} />}
                                        {svc.category?.toLowerCase() === "nails" && <Sparkles size={24} />}
                                        {svc.category?.toLowerCase() === "special" && <Star size={24} />}
                                        {!svc.category && <Sparkles size={24} />}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-900 truncate">{svc.name}</p>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                    {svc.description || svc.duration || t('premium_service_desc')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 ml-4">
                            <span className="text-lg font-black text-gray-900 whitespace-nowrap">
                                {svc.price} <span className="text-xs font-bold text-gray-400">AED</span>
                            </span>
                            <Button size="sm" className="rounded-xl px-6 font-bold uppercase tracking-tight shadow-md hover:shadow-lg transition-all">{t('book')}</Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
