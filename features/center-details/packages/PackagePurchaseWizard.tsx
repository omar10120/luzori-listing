"use client";

import React, { useMemo, useState } from "react";
import type { CenterDetailData, CenterPackage } from "@/lib/apiEndpoints";
import { ArrowLeft, ChevronRight, CheckCircle2, Wallet, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { fetchUserProfile, storePackages } from "@/lib/api";
import { cn } from "@/lib/utils";

type PackageStep = "services" | "professional" | "time" | "confirm";

interface PackagePurchaseWizardProps {
  center: CenterDetailData;
  selectedPackages: CenterPackage[];
  onBack: () => void;
  onSuccess: (message: string) => void;
}

export default function PackagePurchaseWizard({
  center,
  selectedPackages,
  onBack,
  onSuccess,
}: PackagePurchaseWizardProps) {
  const t = useTranslations();
  const [step, setStep] = useState<PackageStep>("services");
  const [paymentType, setPaymentType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userWallet, setUserWallet] = useState(0);

  const steps: PackageStep[] = ["services", "professional", "time", "confirm"];
  const totalPrice = useMemo(
    () =>
      selectedPackages.reduce(
        (sum, pkg) =>
          sum + (pkg.ServicePaid || []).reduce((svcSum, item) => svcSum + Number(item.service?.price || 0), 0),
        0
      ),
    [selectedPackages]
  );
  const isWalletDisabled = userWallet < totalPrice;

  React.useEffect(() => {
    const loadWallet = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const profile = await fetchUserProfile(token);
      if (profile?.wallet !== undefined && profile?.wallet !== null) {
        setUserWallet(Number(profile.wallet) || 0);
      }
    };
    void loadWallet();
  }, []);

  const labelFor = (s: PackageStep) => {
    if (s === "services") return t("services");
    if (s === "professional") return t("professional");
    if (s === "time") return t("time");
    return t("confirm");
  };

  const handleNext = async () => {
    if (step !== "confirm") {
      setStep(steps[steps.indexOf(step) + 1]);
      return;
    }
    if (!paymentType || selectedPackages.length === 0) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      const redirect = encodeURIComponent(window.location.pathname);
      const localePrefix = window.location.pathname.split("/").filter(Boolean)[0] || "en";
      window.location.href = `/${localePrefix}/login?redirect=${redirect}`;
      return;
    }

    setSubmitting(true);
    const result = await storePackages(token, center.id, selectedPackages.map((p) => p.id), paymentType);
    setSubmitting(false);

    if (result.success) {
      onSuccess(result.message || t("package_purchase_success"));
      return;
    }
    window.alert(result.message || t("package_purchase_failed"));
  };

  const isDisabled =
    submitting ||
    selectedPackages.length === 0 ||
    (step === "confirm" && !new Set(["wallet", "cash", "credit_card", "service_cash"]).has(paymentType)) ||
    (step === "confirm" && paymentType === "wallet" && isWalletDisabled);

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            if (step === "services") {
              onBack();
            } else {
              setStep(steps[steps.indexOf(step) - 1]);
            }
          }}
          className="mr-2 text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={18} />
        </button>
        {steps.map((s, idx) => (
          <React.Fragment key={s}>
            <span className={step === s ? "font-bold text-gray-900" : "text-gray-500"}>{labelFor(s)}</span>
            {idx < steps.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      {step === "services" && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">{t("packages")}</h3>
          {selectedPackages.map((pkg) => (
            <div key={pkg.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-semibold text-gray-900">{pkg.name}</p>
              <p className="text-xs text-gray-500">
                {(pkg.ServicePaid || []).length + (pkg.ServiceFree || []).length} {t("services")}
              </p>
            </div>
          ))}
        </div>
      )}

      {step === "professional" && (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
          {t("package_step_no_action")}
        </div>
      )}

      {step === "time" && (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
          {t("package_step_no_action")}
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">{t("payment_method")}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                id: "wallet",
                label: t("wallet"),
                icon: Wallet,
                description: `${t("current_balance")}: ${t("activity_currency_aed")} ${userWallet}`,
                disabled: isWalletDisabled,
              },
              // {
              //   id: "cash",
              //   label: t("cash"),
              //   icon: CreditCard,
              //   description: t("package_pay_at_center"),
              //   disabled: false,
              // },
              {
                id: "credit_card",
                label: t("credit_card"),
                icon: CreditCard,
                description: t("booking_secure_online_payment"),
                disabled: false,
              },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentType === method.id;
              return (
              <button
                key={method.id}
                type="button"
                onClick={() => !method.disabled && setPaymentType(method.id)}
                disabled={method.disabled}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                  isSelected
                    ? "border-[#225D5C] bg-[#225D5C]/5 ring-4 ring-[#225D5C]/10"
                    : "border-gray-100 bg-white hover:border-gray-200",
                  method.disabled && "cursor-not-allowed opacity-50 grayscale"
                )}
              >
                <Icon className={cn("h-6 w-6", isSelected ? "text-[#225D5C]" : "text-gray-400")} />
                <p className="text-sm font-bold text-gray-900">{method.label}</p>
                <p className="text-[10px] leading-tight text-gray-500">{method.description}</p>
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#225D5C] text-white">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                )}
                {method.id === "wallet" && isWalletDisabled && (
                  <span className="text-[10px] font-bold text-red-500">{t("insufficient_balance")}</span>
                )}
              </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm font-semibold text-gray-600">{t("activity_total")}</span>
            <span className="text-base font-black text-gray-900">
              {t("activity_currency_aed")} {totalPrice}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button
          onClick={() => void handleNext()}
          disabled={isDisabled}
          className="w-full rounded-xl font-bold uppercase tracking-wide"
        >
          {submitting ? t("booking_processing") : step === "confirm" ? t("booking_confirm_booking") : t("save_and_continue")}
        </Button>
      </div>
    </section>
  );
}
