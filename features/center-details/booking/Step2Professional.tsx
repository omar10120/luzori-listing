"use client";

import React, { useEffect } from "react";
import { SelectedService } from "./BookingWizard";
import { Users, UserPlus, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2ProfessionalProps {
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
    type: "any" | "per_service";
    setType: (t: "any" | "per_service") => void;
    branches: any[];
    selectedBranchId: number | null;
    setSelectedBranchId: (id: number) => void;
}

export default function Step2Professional({
    selectedServices,
    setSelectedServices,
    type,
    setType,
    branches,
    selectedBranchId,
    setSelectedBranchId,
}: Step2ProfessionalProps) {
    
    // Automatically assign first worker of the selected branch if 'any' is selected
    const handleTypeSelect = (newType: "any" | "per_service", branchId: number | null = selectedBranchId) => {
        setType(newType);
        if (newType === "any") {
            const updated = selectedServices.map(svc => {
                const branchWorkers = svc.workers?.filter(w => w.branch_id === branchId) || [];
                return {
                    ...svc,
                    selectedWorkerId: branchWorkers.length > 0 ? branchWorkers[0].id : null
                };
            });
            setSelectedServices(updated);
        } else {
            // clear selections when switching to per_service
            const updated = selectedServices.map(svc => ({
                ...svc,
                selectedWorkerId: null
            }));
            setSelectedServices(updated);
        }
    };

    // Re-assign workers if branch changes while in 'any' mode
    useEffect(() => {
        if (type === "any" && selectedBranchId) {
             const updated = selectedServices.map(svc => {
                const branchWorkers = svc.workers?.filter(w => w.branch_id === selectedBranchId) || [];
                return {
                    ...svc,
                    selectedWorkerId: branchWorkers.length > 0 ? branchWorkers[0].id : null
                };
            });
            setSelectedServices(updated);
        }
    }, [selectedBranchId, type]);

    const handleWorkerSelect = (serviceId: number, workerId: number) => {
        const updated = selectedServices.map(svc => 
            svc.id === serviceId ? { ...svc, selectedWorkerId: workerId } : svc
        );
        setSelectedServices(updated);
    };

    const handleBranchSelect = (branchId: number) => {
        setSelectedBranchId(branchId);
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Select professional</h1>
            
            {/* Branch Selection Section */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900">Select branch</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {branches.map((branch) => (
                        <div 
                            key={branch.id}
                            onClick={() => handleBranchSelect(branch.id)}
                            className={cn(
                                "flex-shrink-0 w-64 p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm",
                                selectedBranchId === branch.id 
                                    ? "border-[#623ce1] bg-[#623ce1]/5 ring-2 ring-[#623ce1]/10" 
                                    : "border-gray-100 bg-white hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    selectedBranchId === branch.id ? "bg-[#623ce1] text-white" : "bg-gray-100 text-gray-500"
                                )}>
                                    <Building2 size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{branch.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{branch.city}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900">Assign professionals</h3>
                {/* Option: Any Professional */}
                <div 
                    onClick={() => handleTypeSelect("any")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                        type === "any" ? "border-[#623ce1] bg-[#623ce1]/5 ring-4 ring-[#623ce1]/10" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#623ce1]/10 text-[#623ce1] flex items-center justify-center shrink-0">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Any professional</p>
                            <p className="text-sm text-gray-500 mt-1">for maximum availability</p>
                        </div>
                    </div>
                    <div className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                        type === "any" ? "bg-[#623ce1] text-white border-[#623ce1]" : "bg-white text-gray-900 border-gray-200"
                    )}>
                        {type === "any" ? "Selected" : "Select"}
                    </div>
                </div>

                {/* Option: Select per service */}
                <div 
                    onClick={() => handleTypeSelect("per_service")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                        type === "per_service" ? "border-[#623ce1] bg-[#623ce1]/5 ring-4 ring-[#623ce1]/10" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#623ce1]/10 text-[#623ce1] flex items-center justify-center shrink-0">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Select professional per service</p>
                            <p className="text-sm text-gray-500 mt-1">choose exactly who you want</p>
                        </div>
                    </div>
                    <div className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                        type === "per_service" ? "bg-[#623ce1] text-white border-[#623ce1]" : "bg-white text-gray-900 border-gray-200"
                    )}>
                        {type === "per_service" ? "Selected" : "Select"}
                    </div>
                </div>
            </div>

            {/* If Per Service is Selected, show dropdowns for each service */}
            {type === "per_service" && selectedServices.length > 0 && (
                <div className="flex flex-col gap-6 mt-6 border-t border-gray-100 pt-8">
                    <div className="flex flex-col gap-4">
                        {selectedServices.map(svc => {
                            const branchWorkers = svc.workers?.filter(w => w.branch_id === selectedBranchId) || [];
                            
                            return (
                                <div key={svc.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{svc.name}</p>
                                        <p className="text-sm text-gray-500">{svc.duration || "1 hr"}</p>
                                    </div>
                                    <div className="w-full sm:w-64 shrink-0">
                                        <select 
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[#623ce1] focus:border-[#623ce1] outline-none disabled:opacity-50"
                                            value={svc.selectedWorkerId || ""}
                                            onChange={(e) => handleWorkerSelect(svc.id, parseInt(e.target.value))}
                                            disabled={branchWorkers.length === 0}
                                        >
                                            <option value="" disabled>{branchWorkers.length > 0 ? "Select a professional" : "No professionals available in this branch"}</option>
                                            {branchWorkers.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

