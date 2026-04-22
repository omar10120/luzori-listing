"use client";

import React from "react";
import type { CenterPackage, UserPurchasedPackage } from "@/lib/apiEndpoints";
import type { SelectedService } from "./BookingWizard";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface Step4PackagesProps {
    selectedServices: SelectedService[];
    setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>;
    centerPackages: CenterPackage[];
    purchasedPackages: UserPurchasedPackage[];
}

function packageIncludesService(pkg: CenterPackage, serviceId: number): boolean {
    const paid = pkg.ServicePaid || [];
    const free = pkg.ServiceFree || [];
    return [...paid, ...free].some((entry) => entry.service?.id === serviceId);
}

export default function Step4Packages({
    selectedServices,
    setSelectedServices,
    centerPackages,
    purchasedPackages,
}: Step4PackagesProps) {
    const t = useTranslations();

    const centerPackageMap = new Map<number, CenterPackage>(
        centerPackages.map((pkg) => [pkg.id, pkg])
    );

    const getEligibleUserPackagesForService = (serviceId: number) => {
        return purchasedPackages.filter((userPkg) => {
            const pkgDef = centerPackageMap.get(userPkg.package_id);
            if (!pkgDef) return false;
            if (!packageIncludesService(pkgDef, serviceId)) return false;

            const alreadyUsedForService = (userPkg.used_packages || []).some(
                (usage) => usage.service_id === serviceId
            );
            return !alreadyUsedForService;
        });
    };

    const handleServicePackageChange = (serviceId: number, userPackageIdValue: string) => {
        const normalized = userPackageIdValue ? [Number(userPackageIdValue)] : [];
        setSelectedServices((prev) =>
            prev.map((svc) => (svc.id === serviceId ? { ...svc, userPackageIds: normalized } : svc))
        );
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
                {t("my_packages")}
            </h1>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                {selectedServices.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("package_no_services_to_assign")}</p>
                ) : (
                    <div className="space-y-6">
                        {selectedServices.map((svc) => {
                            const eligibleUserPackages = getEligibleUserPackagesForService(svc.id);
                            return (
                                <div key={svc.id} className="rounded-2xl border border-gray-100 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-base font-bold text-gray-900">{svc.name}</p>
                                        <span className="text-xs font-semibold text-gray-500">
                                            {t("activity_currency_aed")} {svc.price}
                                        </span>
                                    </div>

                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {t("package_use_for_service")}
                                    </label>
                                    <div className="relative">
                                        <Package
                                            size={16}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <select
                                            value={svc.userPackageIds?.[0] ? String(svc.userPackageIds[0]) : ""}
                                            onChange={(e) => handleServicePackageChange(svc.id, e.target.value)}
                                            className="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225D5C]/40"
                                        >
                                            <option value="">{t("package_do_not_use")}</option>
                                            {eligibleUserPackages.map((userPkg) => (
                                                <option key={userPkg.id} value={userPkg.id}>
                                                    {userPkg.package_name} #{userPkg.id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {eligibleUserPackages.length === 0 && (
                                        <p className="mt-2 text-xs text-amber-700">
                                            {t("package_not_available_for_service")}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
