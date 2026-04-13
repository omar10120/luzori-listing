"use client";

import React, { useEffect } from "react";
import { SelectedService } from "./BookingWizard";
import { Users, UserPlus, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step2ProfessionalProps {
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
    type: "any" | "per_service";
    setType: (t: "any" | "per_service") => void;
    branches: any[]; //eslint-disable-line
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
            const updated = selectedServices.map(svc => ({
                ...svc,
                selectedWorkerId: null
            }));
            setSelectedServices(updated);
        }
    };

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

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Select professional</h1>

            {/* Branch Selection */}
            {branches.length > 1 && (
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Select branch</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {branches.map((branch) => (
                            <div
                                key={branch.id}
                                onClick={() => setSelectedBranchId(branch.id)}
                                className={cn(
                                    "flex-shrink-0 w-64 p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm",
                                    selectedBranchId === branch.id
                                        ? "border-[#225D5C] bg-[#225D5C]/5 ring-2 ring-[#225D5C]/10"
                                        : "border-gray-100 bg-white hover:border-gray-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                        selectedBranchId === branch.id ? "bg-[#225D5C] text-white" : "bg-gray-100 text-gray-500"
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
            )}

            {/* Assign Type: Any / Per Service */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900">Assign professionals</h3>

                <div
                    onClick={() => handleTypeSelect("any")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                        type === "any" ? "border-[#225D5C] bg-[#225D5C]/5 ring-4 ring-[#225D5C]/10" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#225D5C]/10 text-[#225D5C] flex items-center justify-center shrink-0">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Any professional</p>
                            <p className="text-sm text-gray-500 mt-1">for maximum availability</p>
                        </div>
                    </div>
                    <div className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                        type === "any" ? "bg-[#225D5C] text-white border-[#225D5C]" : "bg-white text-gray-900 border-gray-200"
                    )}>
                        {type === "any" ? "Selected" : "Select"}
                    </div>
                </div>

                <div
                    onClick={() => handleTypeSelect("per_service")}
                    className={cn(
                        "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                        type === "per_service" ? "border-[#225D5C] bg-[#225D5C]/5 ring-4 ring-[#225D5C]/10" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#225D5C]/10 text-[#225D5C] flex items-center justify-center shrink-0">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Select professional per service</p>
                            <p className="text-sm text-gray-500 mt-1">choose exactly who you want</p>
                        </div>
                    </div>
                    <div className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                        type === "per_service" ? "bg-[#225D5C] text-white border-[#225D5C]" : "bg-white text-gray-900 border-gray-200"
                    )}>
                        {type === "per_service" ? "Selected" : "Select"}
                    </div>
                </div>
            </div>

            {/* Per Service: Worker Card List */}
            {type === "per_service" && selectedServices.length > 0 && (
                <div className="flex flex-col gap-8 mt-2 border-t border-gray-100 pt-8">
                    {selectedServices.map(svc => {
                        const branchWorkers = svc.workers?.filter(w => w.branch_id === selectedBranchId) || svc.workers || [];

                        return (
                            <div key={svc.id} className="flex flex-col gap-4">
                                {/* Service label */}
                                <div className="flex items-center justify-between">
                                    <p className="text-base font-bold text-gray-900">{svc.name}</p>
                                    <span className="text-sm font-semibold text-gray-500">AED {svc.price}</span>
                                </div>

                                {branchWorkers.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No professionals available for this branch.</p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {branchWorkers.map(worker => {
                                            const isSelected = svc.selectedWorkerId === worker.id;
                                            return (
                                                <div
                                                    key={worker.id}
                                                    onClick={() => handleWorkerSelect(svc.id, worker.id)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md",
                                                        isSelected
                                                            ? "border-[#225D5C] bg-[#225D5C]/5 ring-4 ring-[#225D5C]/10"
                                                            : "border-gray-100 bg-white hover:border-gray-200"
                                                    )}
                                                >
                                                    {/* Avatar */}
                                                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
                                                        {worker.image ? (
                                                            <Image
                                                                src={worker.image}
                                                                alt={worker.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#225D5C]/10 flex items-center justify-center text-[#225D5C] text-xl font-bold">
                                                                {worker.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-bold text-gray-900">{worker.name}</p>
                                                        <p className="text-sm text-gray-500 mt-0.5">Professional</p>
                                                    </div>

                                                    {/* Select / Check */}
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                                        isSelected
                                                            ? "bg-[#225D5C] text-white shadow-md"
                                                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                                                    )}>
                                                        <Check size={18} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
