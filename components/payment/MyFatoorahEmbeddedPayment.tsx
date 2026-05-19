"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Loader2, RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  MYFATOORAH_SESSION_SCRIPT_URL,
  type MyFatoorahPaymentCallbackPayload,
} from "@/lib/myfatoorah";
import {
  useMyFatoorahEmbeddedPayment,
  type EmbeddedPaymentStatus,
} from "@/hooks/useMyFatoorahEmbeddedPayment";

export interface MyFatoorahEmbeddedPaymentProps {
  active: boolean;
  amount: number;
  currency?: string;
  customerReference?: string;
  centerId?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  modal?: boolean;
  open?: boolean;
  onClose?: () => void;
  onPaymentComplete?: (payload: MyFatoorahPaymentCallbackPayload) => void;
  onPaymentFailed?: (message: string) => void;
}

function statusLabel(status: EmbeddedPaymentStatus, t: (k: string) => string): string {
  switch (status) {
    case "loading_script":
      return t("payment_loading_gateway");
    case "creating_session":
      return t("payment_creating_session");
    case "ready":
      return t("payment_enter_card_details");
    case "processing":
      return t("payment_processing");
    case "success":
      return t("payment_success");
    case "failed":
    case "error":
      return t("payment_failed");
    default:
      return "";
  }
}

export default function MyFatoorahEmbeddedPayment({
  active,
  amount,
  currency = "AED",
  customerReference,
  centerId,
  title,
  subtitle,
  className,
  modal = false,
  open = true,
  onClose,
  onPaymentComplete,
  onPaymentFailed,
}: MyFatoorahEmbeddedPaymentProps) {
  const t = useTranslations();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isActive = active && (!modal || open);

  const { containerId, status, errorMessage, retry } = useMyFatoorahEmbeddedPayment({
    active: isActive,
    amount,
    currency,
    customerReference,
    centerId,
    scriptLoaded,
    onComplete: (parsed) => {
      onPaymentComplete?.(parsed.raw);
    },
    onError: (msg) => {
      const text =
        msg === "login_required"
          ? t("login_required")
          : msg.startsWith("payment_") || msg.startsWith("package_")
            ? t(msg)
            : msg;
      onPaymentFailed?.(text);
    },
  });

  const showSpinner =
    status === "idle" ||
    status === "loading_script" ||
    status === "creating_session" ||
    status === "processing";

  const showRetry = status === "error" || status === "failed";

  const panel = (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
        className
      )}
    >
      {(title || subtitle) && (
        <div>
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm">
        <span className="text-gray-600">{t("activity_total")}</span>
        <span className="font-black text-gray-900">
          {currency} {amount.toFixed(2)}
        </span>
      </div>

      {status !== "idle" && (
        <p
          className={cn(
            "text-center text-sm font-medium",
            status === "success" && "text-green-600",
            (status === "failed" || status === "error") && "text-red-600",
            showSpinner && "text-gray-500"
          )}
        >
          {statusLabel(status, t)}
        </p>
      )}

      <div className="relative min-h-[220px]">
        {showSpinner && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80">
            <Loader2 className="h-8 w-8 animate-spin text-[#225D5C]" />
            <span className="text-xs text-gray-500">{statusLabel(status, t)}</span>
          </div>
        )}

        <div id={containerId} className="w-full min-h-[200px]" aria-live="polite" />
      </div>

      {showRetry && (
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          {t("payment_retry")}
        </button>
      )}

      {errorMessage && showRetry && (
        <p className="text-center text-xs text-red-500">
          {errorMessage.startsWith("payment_") || errorMessage.startsWith("package_")
            ? t(errorMessage)
            : errorMessage}
        </p>
      )}
    </div>
  );

  return (
    <>
      <Script
        src={MYFATOORAH_SESSION_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => onPaymentFailed?.(t("payment_script_load_failed"))}
      />

      {modal && open ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute -right-1 -top-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
            {panel}
          </div>
        </div>
      ) : (
        !modal && panel
      )}
    </>
  );
}
