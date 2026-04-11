import React from "react";
import { CenterDetailData } from "@/lib/apiEndpoints";
import { SelectedService } from "./BookingWizard";
import { CheckCircle2, User, Clock, MapPin, Wallet, CreditCard, Banknote } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Step4ConfirmProps {
    center: CenterDetailData;
    selectedServices: SelectedService[];
    professionalType: "any" | "per_service";
    paymentType: string;
    setPaymentType: (t: string) => void;
    userWallet: number;
}

export default function Step4Confirm({
    center,
    selectedServices,
    professionalType,
    paymentType,
    setPaymentType,
    userWallet
}: Step4ConfirmProps) {
    const t = useTranslations();
    const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
    const isWalletDisabled = userWallet < totalPrice;

    const paymentOptions = [
        { id: "wallet", label: t('wallet') || "Wallet", icon: Wallet, description: `${t('current_balance') || 'Balance'}: AED ${userWallet}`, disabled: isWalletDisabled },
        // { id: "service_cash", label: t('cash') || "Service Cash", icon: Banknote, description: "Pay at the center" },
        { id: "credit_card", label: t('credit_card') || "Credit Card", icon: CreditCard, description: "Secure online payment" },
    ];

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Confirm Booking</h1>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-8">

                {/* Header Note */}
                <div className="flex items-center gap-4 p-4 bg-[#225D5C]/5 rounded-2xl border border-[#225D5C]/10 text-[#225D5C]">
                    <CheckCircle2 size={24} className="text-[#225D5C] shrink-0" />
                    <p className="font-medium text-sm">Please review your booking details below. Click "Book Now" on the right to finalize your appointment.</p>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Location</h3>
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <MapPin size={20} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{center.name}</p>
                            <p className="text-base text-gray-500 mt-1">{center.branches?.[0]?.address || center.domain}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{center.branches?.[0]?.city}</p>
                        </div>
                    </div>
                </div>

                {/* Services Checklist */}
                <div className="flex flex-col gap-4 border-t border-gray-100 pt-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Services ({selectedServices.length})</h3>

                    <div className="flex flex-col gap-6">
                        {selectedServices.map((svc, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="flex-1">
                                    <p className="text-lg font-bold text-gray-900">{svc.name}</p>

                                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span className="font-medium capitalize">
                                                {professionalType === 'any' ? "Any professional" : (svc.workers?.find(w => w.id === svc.selectedWorkerId)?.name || 'Selected professional')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span className="font-medium">
                                                {svc.date} • {svc.fromTime} - {svc.toTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-lg font-black text-gray-900 text-right">
                                    AED {svc.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Price (Mobile Helper) */}
                <div className="flex justify-between items-center sm:hidden border-t border-gray-100 pt-6">
                    <span className="text-gray-500 font-bold">Total Price</span>
                    <span className="text-2xl font-black text-gray-900">AED {totalPrice}</span>
                </div>

                {/* Payment Method Selection */}
                <div className="flex flex-col gap-4 border-t border-gray-100 pt-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('payment_method') || "Payment Method"}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {paymentOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = paymentType === opt.id;

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => !opt.disabled && setPaymentType(opt.id)}
                                    disabled={opt.disabled}
                                    className={cn(
                                        "flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all gap-2 relative",
                                        isSelected
                                            ? "border-[#225D5C] bg-[#225D5C]/5 ring-4 ring-[#225D5C]/10"
                                            : "border-gray-100 bg-white hover:border-gray-200",
                                        opt.disabled && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", isSelected ? "text-[#225D5C]" : "text-gray-400")} />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{opt.label}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#225D5C] rounded-full flex items-center justify-center text-white">
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        </div>
                                    )}

                                    {opt.id === 'wallet' && isWalletDisabled && (
                                        <span className="text-[10px] text-red-500 font-bold mt-1">
                                            {t('insufficient_balance') || "Insufficient balance"}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
