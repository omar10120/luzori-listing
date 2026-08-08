"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import type { CenterDetailData, Service, UserPurchasedPackage } from "@/lib/apiEndpoints";
import { ChevronRight, ArrowLeft, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import MyFatoorahEmbeddedPayment from "@/components/payment/MyFatoorahEmbeddedPayment";
import toast from "react-hot-toast";
import Step1Services from "./Step1Services";
import Step2Professional from "./Step2Professional";
import Step3Time from "./Step3Time";
import Step4Packages from "./Step4Packages";
import Step4Confirm from "./Step4Confirm";
import BookingCart from "./BookingCart";

const BOOKING_RESUME_KEY = "luzori_booking_resume_state";

function getLocalizedLoginPath(pathname: string): string {
    const parts = pathname.split("/").filter(Boolean);
    const maybeLocale = parts[0];
    if (maybeLocale && maybeLocale.length <= 5) {
        return `/${maybeLocale}/login`;
    }
    return "/login";
}

interface BookingWizardProps {
    center: CenterDetailData;
    onCancel: () => void;
    initialSelectedServices?: SelectedService[];
    purchasedPackages?: UserPurchasedPackage[];
}

export type BookingStep = "services" | "professional" | "time" | "packages" | "confirm";

export interface SelectedService extends Service {
    categoryName?: string;
    selectedWorkerId?: number | null;
    date?: string;
    fromTime?: string;
    toTime?: string;
    userPackageIds?: number[];
}

export default function BookingWizard({ center, onCancel, initialSelectedServices = [], purchasedPackages = [] }: BookingWizardProps) {
    const t = useTranslations();

    // -- Wizard State --
    // Always start on step 1 — pre-selected service will appear checked
    const [currentStep, setCurrentStep] = useState<BookingStep>("services");

    // -- Booking Data State --
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>(initialSelectedServices);
    const [professionalType, setProfessionalType] = useState<"any" | "per_service">("any");
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(
        center.branches && center.branches.length > 0 ? center.branches[0].id : null
    );
    const [paymentType, setPaymentType] = useState<string>("");
    const [userWallet, setUserWallet] = useState<number>(0);

    const fetchWalletBalance = async () => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const { fetchUserProfile } = await import("@/lib/api");
                const profile = await fetchUserProfile(token);
                if (profile && profile.wallet !== undefined) {
                    setUserWallet(profile.wallet);
                }
            } catch (err) {
                console.error("Failed to fetch wallet:", err);
            }
        }
    };

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    // We can also have global date/time if we change to "per booking" time, 
    // but the API dictates time per service. We'll track it in the selectedServices objects.

    const steps: BookingStep[] = ["services", "professional", "time", "packages", "confirm"];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{ id: string | number } | null>(null);
    const [didRestoreFromSession, setDidRestoreFromSession] = useState(false);
    const [embeddedPayment, setEmbeddedPayment] = useState<{
        amount: number;
        reference: string;
    } | null>(null);

    const clearResumeState = () => {
        if (typeof window === "undefined") return;
        sessionStorage.removeItem(BOOKING_RESUME_KEY);
    };

    const persistResumeState = (step: BookingStep = currentStep) => {
        if (typeof window === "undefined") return;
        const payload = {
            centerId: center.id,
            path: window.location.pathname,
            currentStep: step,
            selectedServices: selectedServices.map((svc) => ({
                id: svc.id,
                name: svc.name,
                price: svc.price,
                duration: svc.duration,
                categoryName: svc.categoryName,
        
                selectedWorkerId: svc.selectedWorkerId,
                date: svc.date,
                fromTime: svc.fromTime,
                toTime: svc.toTime,
                userPackageIds: svc.userPackageIds,
        
                // only keep plain data
                workers: svc.workers?.map((w) => ({
                    id: w.id,
                    name: w.name,
                })),
            })),
            professionalType,
            selectedBranchId,
            paymentType,
        };
        sessionStorage.setItem(BOOKING_RESUME_KEY, JSON.stringify(payload));
    };

    const handleNext = async () => {
        if (currentStep === "confirm") {
            await handleSubmit();
            return;
        }

        // Enforce login right before entering the confirm step.
        if (currentStep === "time") {
            const token = localStorage.getItem("authToken");
            if (!token) {
                persistResumeState("packages");
                const redirect = encodeURIComponent(window.location.pathname);
                window.location.href = `${getLocalizedLoginPath(window.location.pathname)}?redirect=${redirect}`;
                return;
            }
        }

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            const nextStep = steps[currentIndex + 1];
            setCurrentStep(nextStep);
            persistResumeState(nextStep);
        }
    };

    const handleBack = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        } else {
            clearResumeState();
            onCancel(); // exit booking mode if back pressed on first step
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            persistResumeState("confirm");
            alert(t('login_required'));
            const redirect = encodeURIComponent(window.location.pathname);
            window.location.href = `${getLocalizedLoginPath(window.location.pathname)}?redirect=${redirect}`;
            return;
        }

        setIsSubmitting(true);

        // Build Payload
        const allServicesCoveredByPackages = selectedServices.length > 0 && selectedServices.every(svc => svc.userPackageIds && svc.userPackageIds.length > 0);
        
        const payload: any = {
            center_id: center.id,
            branch_id: selectedBranchId || (center.branches?.[0]?.id) || 1, // Use selectedBranchId
            services: selectedServices.map(svc => ({
                id: svc.id,
                worker_id: svc.selectedWorkerId || (svc.workers?.[0]?.id) || 1, // Send first worker ID or fallback
                date: svc.date,
                from_time: svc.fromTime,
                to_time: svc.toTime,
                user_package_ids: svc.userPackageIds || [],
            })),
        };

        if (!allServicesCoveredByPackages && paymentType) {
            payload.payment_type = paymentType;
        }

        try {
            // we need to dynamically import storeBooking so we don't cause client module errors if not already imported
            const { storeBooking, fetchUserProfile } = await import("@/lib/api");

            // Re-fetch wallet balance to be sure
            if (paymentType === "wallet") {
                const profile = await fetchUserProfile(token);
                const currentWallet = profile?.wallet || 0;
                setUserWallet(currentWallet);

                const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
                if (currentWallet < totalPrice) {
                    alert(t('insufficient_balance'));
                    setIsSubmitting(false);
                    return;
                }
            }

            const res = await storeBooking(token, payload);

            if (!res.success) {
                alert(res.message || t("booking_failed_create"));
                return;
            }

            const bookingRef = String(res.data?.sale?.id ?? res.data?.id ?? "");

            if (paymentType === "service_cash") {
                const totalPrice = selectedServices.reduce(
                    (sum, s) => sum + Number(s.price),
                    0
                );
                setEmbeddedPayment({
                    amount: totalPrice,
                    reference: bookingRef || `booking-${center.id}`,
                });
                return;
            }

            setSuccessData({ id: bookingRef || "—" });
            clearResumeState();
        } catch (err) {
            console.error(err);
            alert(t("booking_error_during_booking"));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to render breadcrumbs
    const renderBreadcrumbs = () => {
        const getLabel = (step: BookingStep) => {
            switch (step) {
                case "services": return t('services') || "Services";
                case "professional": return t('professional') || "Professional";
                case "time": return t('time') || "Time";
                case "packages": return t('my_packages') || "My Packages";
                case "confirm": return t('confirm') || "Confirm";
            }
        };

        return (
            <div className="flex items-center gap-2 text-sm font-medium mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button onClick={handleBack} className="text-gray-400 hover:text-gray-900 transition-colors mr-2">
                    <ArrowLeft size={18} />
                </button>
                {steps.map((step, idx) => {
                    const isActive = currentStep === step;
                    const isPast = steps.indexOf(currentStep) > idx;
                    const isClickable = isPast || isActive;

                    return (
                        <React.Fragment key={step}>
                            <button
                                onClick={() => isClickable && setCurrentStep(step)}
                                className={`transition-colors capitalize ${isActive ? 'text-gray-900 font-bold' : isClickable ? 'text-gray-500 hover:text-gray-900' : 'text-gray-300 pointer-events-none'}`}
                            >
                                {getLabel(step)}
                            </button>
                            {idx < steps.length - 1 && (
                                <ChevronRight size={14} className="text-gray-300 shrink-0" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    useEffect(() => {
        if (typeof window === "undefined" || didRestoreFromSession) return;
        const raw = sessionStorage.getItem(BOOKING_RESUME_KEY);
        if (!raw) {
            setDidRestoreFromSession(true);
            return;
        }
        try {
            const parsed = JSON.parse(raw) as {
                centerId?: number;
                path?: string;
                currentStep?: BookingStep;
                selectedServices?: SelectedService[];
                professionalType?: "any" | "per_service";
                selectedBranchId?: number | null;
                paymentType?: string;
            };
            if (parsed.centerId !== center.id) {
                setDidRestoreFromSession(true);
                return;
            }
            if (parsed.selectedServices && parsed.selectedServices.length > 0) {
                setSelectedServices(parsed.selectedServices);
            }
            if (parsed.professionalType) setProfessionalType(parsed.professionalType);
            if (parsed.selectedBranchId !== undefined) setSelectedBranchId(parsed.selectedBranchId);
            if (parsed.paymentType) setPaymentType(parsed.paymentType);
            if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        } catch {
            sessionStorage.removeItem(BOOKING_RESUME_KEY);
        } finally {
            setDidRestoreFromSession(true);
        }
    }, [center.id, didRestoreFromSession]);

    useEffect(() => {
        if (!didRestoreFromSession) return;
        persistResumeState(currentStep);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, selectedServices, professionalType, selectedBranchId, paymentType, didRestoreFromSession]);

    return (
        <div className="min-h-screen bg-[#fafafa] pt-24 pb-32">
            <Container>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">

                    {/* Main Content Area (Left) */}
                    <div className="flex-1 w-full min-w-0">
                        {renderBreadcrumbs()}

                        {currentStep === "services" && (
                            <Step1Services
                                center={center}
                                selectedServices={selectedServices}
                                setSelectedServices={setSelectedServices}
                            />
                        )}

                        {currentStep === "professional" && (
                            <Step2Professional
                                selectedServices={selectedServices}
                                setSelectedServices={setSelectedServices}
                                type={professionalType}
                                setType={setProfessionalType}
                                branches={center.branches || []}
                                selectedBranchId={selectedBranchId}
                                setSelectedBranchId={setSelectedBranchId}
                            />
                        )}

                        {currentStep === "time" && (
                            <Step3Time
                                selectedServices={selectedServices}
                                setSelectedServices={setSelectedServices}
                                selectedBranchId={selectedBranchId}
                            />
                        )}

                        {currentStep === "packages" && (
                            <Step4Packages
                                selectedServices={selectedServices}
                                setSelectedServices={setSelectedServices}
                                centerPackages={center.packages || []}
                                purchasedPackages={purchasedPackages}
                            />
                        )}

                        {currentStep === "confirm" && (
                            <Step4Confirm
                                center={center}
                                selectedServices={selectedServices}
                                professionalType={professionalType}
                                paymentType={paymentType}
                                setPaymentType={setPaymentType}
                                userWallet={userWallet}
                            />
                        )}
                    </div>

                    {/* Cart / Summary Area (Right Sticky) */}
                    <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-28">
                        <BookingCart
                            center={center}
                            currentStep={currentStep}
                            selectedServices={selectedServices}
                            onNext={handleNext}
                            professionalType={professionalType}
                            paymentType={paymentType}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </Container>

            {embeddedPayment && (
                <MyFatoorahEmbeddedPayment
                    modal
                    open
                    active
                    amount={embeddedPayment.amount}
                    currency="AED"
                    customerReference={embeddedPayment.reference}
                    centerId={center.id}
                    title={t("booking_online_payment")}
                    subtitle={t("booking_secure_online_payment")}
                    onClose={() => setEmbeddedPayment(null)}
                    onPaymentComplete={() => {
                        const ref = embeddedPayment.reference;
                        setEmbeddedPayment(null);
                        clearResumeState();
                        setSuccessData({ id: ref });
                        toast.success(t("payment_success"));
                    }}
                    onPaymentFailed={(msg) => toast.error(msg)}
                />
            )}

            {/* Success Modal Overlay */}
            {successData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => { setSuccessData(null); onCancel(); }}
                            className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center bg-[#fcebd9] hover:bg-[#fad8b3] transition-colors rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fad8b3]"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>

                        <div className="w-32 h-32 relative mb-6">
                            <Image src="/success.svg" alt="Success" fill className="object-contain" priority />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                            {t('booking_success')}
                        </h2>

                        <p className="text-gray-500 font-medium leading-relaxed">
                            {t('booking_success_msg')}<br />
                            {t('reference_number')} <span className="text-gray-900 font-bold">#{successData.id}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
