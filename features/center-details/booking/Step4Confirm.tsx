"use client";

import React from "react";
import { CenterDetailData } from "@/lib/apiEndpoints";
import { SelectedService } from "./BookingWizard";
import { CheckCircle2, User, Clock, MapPin } from "lucide-react";

interface Step4ConfirmProps {
    center: CenterDetailData;
    selectedServices: SelectedService[];
    professionalType: "any" | "per_service";
}

export default function Step4Confirm({ center, selectedServices, professionalType }: Step4ConfirmProps) {
    
    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Confirm Booking</h1>
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-8">
                
                {/* Header Note */}
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-800">
                    <CheckCircle2 size={24} className="text-blue-500 shrink-0" />
                    <p className="font-medium text-sm">Please review your booking details below. Click "Confirm Booking" on the right to finalize your appointment.</p>
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
                                            <span className="font-medium">
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

                {/* Payment Notice */}
                 <div className="flex flex-col gap-2 border-t border-gray-100 pt-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payment Method</h3>
                    <p className="font-medium text-gray-900">Service Cash (Pay at the center)</p>
                </div>
            </div>
        </div>
    );
}
