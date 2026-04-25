"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { CenterDetailData, CenterPackage } from "@/lib/apiEndpoints";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Wallet,
  CreditCard,
  Package,
  Clock,
  User,
  Award,
  Loader2,
  Sparkles
} from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { fetchUserProfile, storePackages } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type PackageStep = "services" | "professional" | "time" | "confirm";

interface PackagePurchaseWizardProps {
  center: CenterDetailData;
  selectedPackages: CenterPackage[];
  onBack: () => void;
  onSuccess: (message: string) => void;
}

// Helper: format price with currency symbol
const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0 }).format(amount);

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
  const [userWallet, setUserWallet] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  const steps: PackageStep[] = ["services", "professional", "time", "confirm"];
  const totalPrice = useMemo(
    () => selectedPackages.reduce((sum, pkg) => sum + Number(pkg.price || 0), 0),
    [selectedPackages]
  );

  const isWalletAvailable = userWallet !== null;
  const isWalletSufficient = isWalletAvailable && userWallet >= totalPrice;
  const isWalletDisabled = !isWalletAvailable || !isWalletSufficient;

  useEffect(() => {
    const loadWallet = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoadingWallet(false);
        return;
      }
      try {
        const profile = await fetchUserProfile(token);
        const walletAmount = profile?.wallet !== undefined && profile?.wallet !== null ? Number(profile.wallet) : 0;
        setUserWallet(walletAmount);
      } catch (err) {
        console.error("Failed to load wallet", err);
        setUserWallet(0);
      } finally {
        setLoadingWallet(false);
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

  const stepIcon = (s: PackageStep) => {
    if (s === "services") return <Package size={16} />;
    if (s === "professional") return <User size={16} />;
    if (s === "time") return <Clock size={16} />;
    return <Award size={16} />;
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
      toast.success(result.message || t("package_purchase_success"));
      onSuccess(result.message || t("package_purchase_success"));
      return;
    }
    toast.error(result.message || t("package_purchase_failed"));
  };

  const isDisabled =
    submitting ||
    selectedPackages.length === 0 ||
    (step === "confirm" && !["wallet", "cash", "service_cash"].includes(paymentType)) ||
    (step === "confirm" && paymentType === "wallet" && isWalletDisabled);

  // Progress percent for stepper bar
  const progressPercent = ((steps.indexOf(step) + 1) / steps.length) * 100;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/30 transition-all">
      {/* Header with progress bar */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === "services") {
                onBack();
              } else {
                setStep(steps[steps.indexOf(step) - 1]);
              }
            }}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{t("back")}</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium">

            <span className="text-gray-600">{t("package_purchase")}</span>
          </div>
          <div className="text-sm font-semibold text-gray-400">
            {t("step")} {steps.indexOf(step) + 1} / {steps.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#225D5C] to-[#2a7a78] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step labels (desktop) */}
        <div className="mt-3 hidden grid-cols-4 gap-2 text-center text-xs font-medium text-gray-500 sm:grid">
          {steps.map((s, idx) => (
            <div
              key={s}
              className={cn(
                "flex items-center justify-center gap-1 transition-colors",
                steps.indexOf(step) >= idx ? "text-[#225D5C]" : "text-gray-400"
              )}
            >
              {stepIcon(s)}
              <span className="truncate">{labelFor(s)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 md:p-8">
        {step === "services" && (
          <div className="animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t("selected_packages")}</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {selectedPackages.length} {t("packages")}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-[#225D5C]/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("total_services")}: {(pkg.ServicePaid || []).length + (pkg.ServiceFree || []).length}
                      </p>
                    </div>
                    <div className="rounded-full bg-[#225D5C]/10 px-2 py-1 text-sm font-bold text-[#225D5C]">
                      {formatPrice(Number(pkg.price || 0))}
                    </div>
                  </div>
                  {(pkg.ServicePaid?.length > 0 || pkg.ServiceFree?.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1 border-t border-gray-100 pt-2 text-[11px] text-gray-500">
                      {/* {pkg.ServicePaid?.slice(0, 2).map((s) => (
                        <span key={s.id} className="rounded bg-gray-100 px-1.5 py-0.5"> {s.id}</span>
                      ))}
                      {pkg.ServiceFree?.slice(0, 2).map((s) => (
                        <span key={s.id} className="rounded bg-gray-100 px-1.5 py-0.5"> {s.created_at}</span>
                      ))} */}
                      {((pkg.ServicePaid?.length || 0) + (pkg.ServiceFree?.length || 0)) > 2 && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5">+{((pkg.ServicePaid?.length || 0) + (pkg.ServiceFree?.length || 0)) - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-600">
              {t("package_total")}: <span className="text-base font-black text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {step === "professional" && (
          <div className="animate-fadeIn flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-3">
              <User size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800">{t("professional_selection")}</h4>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {t("package_professional_info") || "You can choose preferred staff later in the booking step."}
            </p>
          </div>
        )}

        {step === "time" && (
          <div className="animate-fadeIn flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-3">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800">{t("time_selection")}</h4>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {t("package_time_info") || "You will schedule each service at your convenience."}
            </p>
          </div>
        )}

        {step === "confirm" && (
          <div className="animate-fadeIn space-y-6">
            {/* Order summary */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                <Package size={14} />
                {t("order_summary")}
              </h3>
              <div className="space-y-2">
                {selectedPackages.map((pkg) => (
                  <div key={pkg.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{pkg.name}</span>
                    <span className="font-medium text-gray-900">{formatPrice(Number(pkg.price))}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-bold">
                    <span>{t("activity_total")}</span>
                    <span className="text-[#225D5C]">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                <CreditCard size={14} />
                {t("payment_method")}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    id: "wallet",
                    label: t("wallet"),
                    icon: Wallet,
                    description: loadingWallet ? t("loading_balance") : `${t("current_balance")}: ${formatPrice(userWallet ?? 0)}`,
                    disabled: loadingWallet || isWalletDisabled,
                    highlight: !loadingWallet && isWalletSufficient,
                  },
                  {
                    id: "service_cash",
                    label: t("cash"),
                    icon: CreditCard,
                    description: t("package_pay_at_center"),
                    disabled: false,
                    highlight: false,
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
                        "group relative flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                        isSelected
                          ? "border-[#225D5C] bg-[#225D5C]/5 shadow-md ring-2 ring-[#225D5C]/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                        method.disabled && "cursor-not-allowed opacity-60 grayscale",
                        method.highlight && !isSelected && "border-green-200 bg-green-50/30"
                      )}
                    >
                      <div className="flex-shrink-0 rounded-full bg-gray-100 p-2 group-hover:bg-gray-200">
                        <Icon size={20} className={isSelected ? "text-[#225D5C]" : "text-gray-500"} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{method.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{method.description}</p>
                        {method.id === "wallet" && !loadingWallet && !isWalletSufficient && userWallet !== null && (
                          <p className="mt-1 text-[11px] font-medium text-red-500">{t("insufficient_balance")}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#225D5C] text-white shadow-md">
                          <CheckCircle2 size={14} strokeWidth={3} />
                        </div>
                      )}
                      {method.highlight && !isSelected && (
                        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                          <span className="text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === "services") onBack();
              else setStep(steps[steps.indexOf(step) - 1]);
            }}
            className="rounded-xl border-gray-200 font-medium"
          >
            {step === "services" ? t("go_back") : t("previous")}
          </Button>
          <Button
            onClick={() => void handleNext()}
            disabled={isDisabled}
            className="rounded-xl bg-[#225D5C] px-8 font-bold uppercase tracking-wide transition-all hover:scale-[1.02] hover:bg-[#1a4a49] active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                {t("booking_processing")}
              </>
            ) : step === "confirm" ? (
              t("booking_confirm_booking")
            ) : (
              t("save_and_continue")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

