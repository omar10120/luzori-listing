import React from 'react';
import { Scissors, Sparkles, Users, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
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
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 group-hover:bg-gray-100 transition-colors">
                                {svc.category?.toLowerCase() === "hair" && <Scissors size={18} />}
                                {svc.category?.toLowerCase() === "skin" && <Sparkles size={18} />}
                                {svc.category?.toLowerCase() === "body" && <Users size={18} />}
                                {svc.category?.toLowerCase() === "nails" && <Sparkles size={18} />}
                                {svc.category?.toLowerCase() === "special" && <Star size={18} />}
                                {!svc.category && <Sparkles size={18} />}
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900">{svc.name}</p>
                                <p className="text-sm text-gray-500">{svc.description || svc.duration}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-base font-bold text-gray-900">
                                {svc.price} {typeof svc.price === 'number' ? 'AED' : ''}
                            </span>
                            <Button size="sm" className="rounded-lg px-6">{t('book')}</Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
