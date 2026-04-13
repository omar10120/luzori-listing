"use client";

import React, { useState } from "react";
import { CenterDetailData, Service } from "@/lib/apiEndpoints";
import { SelectedService } from "./BookingWizard";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1ServicesProps {
    center: CenterDetailData;
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
}

export default function Step1Services({ center, selectedServices, setSelectedServices }: Step1ServicesProps) {
    const categories = center.categories || [];
    const allServices = categories.flatMap(c => c.services.map(s => ({ ...s, categoryName: c.name })));

    // Tabs
    const tabs = ["all", ...categories.map(c => c.name)];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    const handleToggleService = (service: Service & { categoryName?: string }) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        if (isSelected) {
            setSelectedServices(prev => prev.filter(s => s.id !== service.id));
        } else {
            setSelectedServices(prev => [...prev, service]);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Services</h1>
            
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-2 border-b border-gray-100">
                 {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all relative border border-transparent",
                            activeTab === tab
                                ? "bg-gray-900 text-white shadow-md border-gray-900"
                                : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                    >
                        {tab === "all" ? "All services" : tab}
                    </button>
                ))}
            </div>

            {/* Content Grouped By Category */}
            <div className="flex flex-col gap-12 mt-2">
                {categories.map(cat => {
                    const servicesInCat = cat.services;
                    if (servicesInCat.length === 0) return null;
                    if (activeTab !== "all" && activeTab !== cat.name) return null;

                    return (
                        <div key={cat.id} className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                            <div className="flex flex-col gap-3">
                                {servicesInCat.map(svc => {
                                    const isSelected = selectedServices.some(s => s.id === svc.id);
                                    
                                    return (
                                        <div 
                                            key={svc.id} 
                                            onClick={() => handleToggleService({ ...svc, categoryName: cat.name })}
                                            className={cn(
                                                "flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                                                isSelected ? "border-[#225D5C] bg-white ring-4 ring-[#225D5C]/10" : "border-gray-100 bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className="flex-1 pr-4">
                                                <p className="text-base font-bold text-gray-900">{svc.name}</p>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {svc.description || svc.duration || "1 hr, 30 min"} • {svc.workers?.length || 1} services 
                                                </p>
                                                <p className="text-sm font-bold text-gray-900 mt-3">AED {svc.price}</p>
                                            </div>
                                            
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm",
                                                isSelected ? "bg-[#225D5C] text-white" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                                            )}>
                                                {isSelected ? <Check size={20} className="stroke-[3]" /> : <Plus size={20} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
