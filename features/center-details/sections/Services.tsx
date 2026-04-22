import React from 'react';
import { Scissors, Sparkles, Users, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Button from '@/components/ui/Button';

import { CenterPackage, Service } from '@/lib/apiEndpoints';

interface ServicesProps {
    services: (Service & { category?: string })[];
    packages: CenterPackage[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: string[];
    onBookNow: (service?: Service & { category?: string }) => void;
    onTogglePackageCart: (pkg: CenterPackage) => void;
    onStartPackageCheckout: () => void;
    selectedPackageIds?: number[];
    purchasedPackageIds?: number[];
}

export default function Services({
    services,
    packages,
    activeTab,
    onTabChange,
    tabs,
    onBookNow,
    onTogglePackageCart,
    onStartPackageCheckout,
    selectedPackageIds = [],
    purchasedPackageIds = [],
}: ServicesProps) {
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
                        {tab === "all" ? t('all') : tab === "packages" ? t("packages") : tab}
                    </button>
                ))}
            </div>

            {activeTab === "packages" ? (
                <div className="space-y-4">
                    {packages.map((pkg) => {
                        const paidServices = pkg.ServicePaid || [];
                        const freeServices = pkg.ServiceFree || [];
                        const totalPaidPrice = paidServices.reduce((sum, item) => sum + Number(item.service?.price || 0), 0);
                        const isPurchased = purchasedPackageIds.includes(pkg.id);
                        const isInCart = selectedPackageIds.includes(pkg.id);
                        
                        return (
                            <div key={pkg.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-base font-bold text-gray-900">{pkg.name}</p>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {t("package_includes_count", { count: paidServices.length + freeServices.length })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="whitespace-nowrap text-lg font-black text-gray-900">
                                            {totalPaidPrice} <span className="text-xs font-bold text-gray-400">{t("activity_currency_aed")}</span>
                                        </span>
                                        <Button
                                            size="sm"
                                            onClick={() => onTogglePackageCart(pkg)}
                                            disabled={isPurchased}
                                            className="rounded-xl px-5 font-bold uppercase tracking-tight shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                                        >
                                            {isPurchased ? t("package_purchased") : isInCart ? t("package_added_to_cart") : t("add_to_cart")}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {paidServices.map((item) => (
                                        <div key={`paid-${item.id}`} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                                            <span className="truncate pr-3 text-sm font-medium text-gray-800">{item.service.name}</span>
                                            <span className="whitespace-nowrap text-xs font-semibold text-gray-500">
                                                {item.service.price} {t("activity_currency_aed")}
                                            </span>
                                        </div>
                                    ))}
                                    {freeServices.map((item) => (
                                        <div key={`free-${item.id}`} className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
                                            <span className="truncate pr-3 text-sm font-medium text-emerald-800">{item.service.name}</span>
                                            <span className="whitespace-nowrap text-xs font-semibold text-emerald-700">{t("package_free_label")}</span>
                                        </div>
                                    ))}
                                    {paidServices.length === 0 && freeServices.length === 0 && (
                                        <p className="text-sm text-gray-500">{t("package_no_services")}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {selectedPackageIds.length > 0 && (
                        <div className="sticky bottom-2 z-10 rounded-2xl border border-[#225D5C]/20 bg-white p-4 shadow-md">
                            <div className="mb-3 text-sm font-semibold text-gray-700">
                                {t("package_cart_count", { count: selectedPackageIds.length })}
                            </div>
                            <Button className="w-full rounded-xl font-bold uppercase" onClick={onStartPackageCheckout}>
                                {t("save_and_continue")}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
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
                                            unoptimized
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
                                <Button size="sm" onClick={() => onBookNow(svc)} className="rounded-xl px-6 font-bold uppercase tracking-tight shadow-md hover:shadow-lg transition-all">{t('book')}</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
