"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import type { CenterDetailData, Service, Worker } from "@/lib/apiEndpoints";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import Step1Services from "./Step1Services";
import Step2Professional from "./Step2Professional";
import Step3Time from "./Step3Time";
import Step4Confirm from "./Step4Confirm";
import BookingCart from "./BookingCart";

interface BookingWizardProps {
    center: CenterDetailData;
    onCancel: () => void;
}

export type BookingStep = "services" | "professional" | "time" | "confirm";

export interface SelectedService extends Service {
    categoryName?: string;
    selectedWorkerId?: number | null;
    date?: string;
    fromTime?: string;
    toTime?: string;
}

export default function BookingWizard({ center, onCancel }: BookingWizardProps) {
    const t = useTranslations();

    // -- Wizard State --
    const [currentStep, setCurrentStep] = useState<BookingStep>("services");

    // -- Booking Data State --
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [professionalType, setProfessionalType] = useState<"any" | "per_service">("any");

    // We can also have global date/time if we change to "per booking" time, 
    // but the API dictates time per service. We'll track it in the selectedServices objects.

    const steps: BookingStep[] = ["services", "professional", "time", "confirm"];

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = async () => {
        if (currentStep === "confirm") {
            await handleSubmit();
            return;
        }

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        } else {
            onCancel(); // exit booking mode if back pressed on first step
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert(t('login_required') || "Please login to book services.");
            return;
        }

        setIsSubmitting(true);

        // Build Payload
        const payload = {
            center_id: center.id,
            branch_id: center.branches?.[0]?.id || 1, // Fallback if no branches
            services: selectedServices.map(svc => ({
                id: svc.id,
                worker_id: svc.selectedWorkerId || (svc.workers?.[0]?.id) || 1, // Send first worker ID or fallback
                date: svc.date,
                from_time: svc.fromTime,
                to_time: svc.toTime
            })),
            payment_type: "service_cash"
        };

        try {
            // we need to dynamically import storeBooking so we don't cause client module errors if not already imported
            const { storeBooking } = await import("@/lib/api");

            const res = await storeBooking(token, payload);

            if (res.success) {
                alert(t('booking_success') || "Booking created successfully!");
                onCancel(); // exit wizard
            } else {
                alert(res.message || "Failed to create booking.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during booking.");
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
                case "confirm": return t('confirm') || "Confirm";
            }
        };

        return (
            <div className="flex items-center gap-2 text-sm font-medium mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-900 transition-colors mr-2">
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
                            />
                        )}

                        {currentStep === "time" && (
                            <Step3Time
                                selectedServices={selectedServices}
                                setSelectedServices={setSelectedServices}
                            />
                        )}

                        {currentStep === "confirm" && (
                            <Step4Confirm
                                center={center}
                                selectedServices={selectedServices}
                                professionalType={professionalType}
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
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
}
