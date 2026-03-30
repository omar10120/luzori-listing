"use client";

import React from "react";
import { SelectedService } from "./BookingWizard";
import { Calendar, Clock } from "lucide-react";

interface Step3TimeProps {
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
}

export default function Step3Time({ selectedServices, setSelectedServices }: Step3TimeProps) {
    
    const handleTimeChange = (serviceId: number, field: 'date' | 'fromTime' | 'toTime', value: string) => {
        const updated = selectedServices.map(svc => 
            svc.id === serviceId ? { ...svc, [field]: value } : svc
        );
        setSelectedServices(updated);
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Select Time</h1>
            
            <div className="flex flex-col gap-6">
                {selectedServices.map(svc => {
                    // Default to today if not set
                    const today = new Date().toISOString().split('T')[0];
                    const dateValue = svc.date || today;

                    return (
                        <div key={svc.id} className="p-6 border-2 border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col gap-6">
                            
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#623ce1]/10 text-[#623ce1] flex items-center justify-center shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-bold text-gray-900">{svc.name}</p>
                                    <p className="text-sm text-gray-500">Duration: {svc.duration || "1 hr"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Date Selection */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-700">Date</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Calendar size={18} />
                                        </div>
                                        <input
                                            type="date"
                                            value={dateValue}
                                            onChange={(e) => handleTimeChange(svc.id, 'date', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#623ce1] focus:ring-2 focus:ring-[#623ce1]/20 outline-none text-gray-900 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* From Time Selection */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-700">From Time</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Clock size={18} />
                                        </div>
                                        <input
                                            type="time"
                                            value={svc.fromTime || ""}
                                            onChange={(e) => handleTimeChange(svc.id, 'fromTime', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#623ce1] focus:ring-2 focus:ring-[#623ce1]/20 outline-none text-gray-900 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* To Time Selection */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-700">To Time</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Clock size={18} />
                                        </div>
                                        <input
                                            type="time"
                                            value={svc.toTime || ""}
                                            onChange={(e) => handleTimeChange(svc.id, 'toTime', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#623ce1] focus:ring-2 focus:ring-[#623ce1]/20 outline-none text-gray-900 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <p className="text-sm text-gray-500 bg-blue-50 text-blue-800 p-4 rounded-xl">
                Please ensure both 'From Time' and 'To Time' are selected for all services to proceed.
            </p>
        </div>
    );
}
