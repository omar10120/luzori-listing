"use client";


import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SuccessModalProps {
    referenceNumber: string | number;
    onClose: () => void;
}

export default function SuccessModal({ referenceNumber, onClose }: SuccessModalProps) {
    const t = useTranslations();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center bg-[#fcebd9] hover:bg-[#fad8b3] transition-colors rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fad8b3]"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

                <div className="w-32 h-32 relative mb-6">
                    <Image src="/success.svg" alt="Success" fill className="object-contain" priority />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                    {t('booking_success_title') || "Your appointment has been booked successfully"}
                </h2>

                <p className="text-gray-500 font-medium leading-relaxed">
                    {t('booking_success_msg') || "Thank you for your interest in Luzori solution."}<br />
                    {t('reference_number') || "Your reference number:"} <span className="text-gray-900 font-bold">#{referenceNumber}</span>
                </p>
            </div>
        </div>
    );
}
