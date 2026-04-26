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
          </div>
        );
      })}
    </div>
  );
}
