"use client";

import React from "react";
import Image from "next/image";
import { CenterDetailData } from "@/lib/apiEndpoints";
import { SelectedService, BookingStep } from "./BookingWizard";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";


interface BookingCartProps {
    center: CenterDetailData;
    selectedServices: SelectedService[];
    currentStep: BookingStep;
    onNext: () => void;
    professionalType: "any" | "per_service";
    paymentType: string;
    isSubmitting?: boolean;
}

export default function BookingCart({ center, selectedServices, currentStep, onNext, professionalType, paymentType, isSubmitting }: BookingCartProps) {
    const t = useTranslations();
    const { isAuthenticated, isLoading } = useAuth();
    const total = selectedServices.reduce((sum, s) => {
        const p = typeof s.price === 'string' ? parseFloat(s.price) : s.price;
        return sum + (p || 0);
    }, 0);

    const allServicesCoveredByPackages = selectedServices.length > 0 && selectedServices.every(svc => svc.userPackageIds && svc.userPackageIds.length > 0);

    const isNextDisabled = () => {
        if (isSubmitting) return true;
        if (currentStep === "services" && selectedServices.length === 0) return true;
        if (currentStep === "time") {
            if (isLoading) return true;
            // Must have selected time for all
            return selectedServices.some(s => !s.date || !s.fromTime || !s.toTime);
        }
        if (currentStep === "confirm") {
            if (allServicesCoveredByPackages) return false;
            const validPaymentTypes = new Set(["wallet", "service_cash"]);
            return !validPaymentTypes.has(paymentType);
        }
        return false;
    };

    const getButtonText = () => {
        if (isSubmitting) return t("booking_processing");
        if (currentStep === "time" && !isLoading && !isAuthenticated) return t("login");
        if (currentStep === "confirm" ) return t("booking_confirm_booking");
        return t("save_and_continue");
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 w-full">
            
            {/* Center Info Header */}
            <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                    <Image 
                        src={center.logo || center.primary_images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035'} 
                        alt={center.name} 
                        fill 
                        className="object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{center.name}</h3>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-1">
                        <span>4.8</span>
                        <div className="flex gap-0.5">
                            <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                            <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                            <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                            <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                            <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                        </div>
                        <span className="text-gray-400 font-normal ml-0.5">(1,513)</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{center.branches?.[0]?.address || center.domain}</p>
                </div>
            </div>

            {/* Selected Services */}
            {selectedServices.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
                    {selectedServices.map(svc => (
                        <div key={svc.id} className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 leading-snug">{svc.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {svc.duration || t("booking_default_short_duration")} • {professionalType === 'any' ? t("booking_any_professional") : t("booking_selected_professional")}
                                </p>
                                {svc.date && svc.fromTime && (
                                     <p className="text-xs font-medium text-[#225D5C] mt-1">
                                        {svc.date} {t("booking_at")} {svc.fromTime}
                                     </p>
                                )}
                            </div>
                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                {t("activity_currency_aed")} {svc.price}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">{t("activity_total")}</span>
                <span className="text-xl font-black text-gray-900">{t("activity_currency_aed")} {total}</span>
            </div>

            <Button 
                onClick={() => {
                    // `onNext` handles auth redirect + booking state persist.
                    onNext();
                }}
                disabled={isNextDisabled()}
                className="w-full bg-black hover:bg-gray-800 text-white rounded-2xl h-14 font-bold text-lg disabled:opacity-50"
            >
                {getButtonText()}
            </Button>

        </div>
    );
}
