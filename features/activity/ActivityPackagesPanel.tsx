"use client";

import React from "react";
import type { UserPurchasedPackage } from "@/lib/apiEndpoints";
import { Package, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ActivityPackagesPanelProps {
  packages: UserPurchasedPackage[];
}

export default function ActivityPackagesPanel({ packages }: ActivityPackagesPanelProps) {
  const t = useTranslations();

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-gray-500">
        {t("activity_no_packages")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {packages.map((pkg) => {
        const usedCount = pkg.used_packages?.length || 0;
        const statusLabel = pkg.status || "active";
        const packageDetails = pkg.package_details;
        const paidServices = packageDetails?.ServicePaid || [];
        const freeServices = packageDetails?.ServiceFree || [];
        return (
          <div key={pkg.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-gray-900">{pkg.package_name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {pkg.center?.name || "-"} · #{pkg.id}
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-black text-gray-900">
                {t("activity_currency_aed")} {pkg.price}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#225D5C]/10 px-2.5 py-1 font-semibold text-[#225D5C]">
                <Package size={12} />
                {t("activity_package_type")}: {pkg.package_type}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                <CheckCircle2 size={12} />
                {t("activity_package_status")}: {statusLabel}
              </span>
              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                {t("activity_package_used_services")}: {usedCount}
              </span>
            </div>

            {(paidServices.length > 0 || freeServices.length > 0) && (
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{t("services")}</p>
                {paidServices.map((entry) => {
                  const isUsed = (pkg.used_packages || []).some((u) => u.service_id === entry.service.id);
                  return (
                    <div
                      key={`paid-${pkg.id}-${entry.id}`}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs ${
                        isUsed ? "bg-amber-50 text-amber-800" : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={isUsed ? "line-through opacity-80" : ""}>{entry.service.name}</span>
                      <span className="font-semibold">
                        {isUsed ? t("activity_package_service_used") : `${entry.service.price} ${t("activity_currency_aed")}`}
                      </span>
                    </div>
                  );
                })}
                {freeServices.map((entry) => {
                  const isUsed = (pkg.used_packages || []).some((u) => u.service_id === entry.service.id);
                  return (
                    <div
                      key={`free-${pkg.id}-${entry.id}`}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs ${
                        isUsed ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <span className={isUsed ? "line-through opacity-80" : ""}>{entry.service.name}</span>
                      <span className="font-semibold">
                        {isUsed ? t("activity_package_service_used") : t("package_free_label")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
