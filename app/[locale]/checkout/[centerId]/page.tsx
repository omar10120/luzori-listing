"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Trash2,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MyFatoorahEmbeddedPayment from "@/components/payment/MyFatoorahEmbeddedPayment";
import { useProductCart } from "@/components/cart/ProductCartContext";
import { fetchUserProfile } from "@/lib/api";
import {
  cartTotal,
  finalizeProductPurchaseAfterPayment,
  isProductPaymentType,
  purchaseProductsWithPayment,
  type ProductPaymentType,
} from "@/lib/productPayment";
import { cn } from "@/lib/utils";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCheckoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ centerId: string }>();
  const centerId = Number(params.centerId);
  const { items, removeItem, clearCenter } = useProductCart();

  const checkoutItems = useMemo(
    () => (Number.isFinite(centerId) ? items.filter((item) => item.centerId === centerId) : []),
    [items, centerId]
  );
  const centerName = checkoutItems[0]?.centerName || "";
  const total = cartTotal(checkoutItems);

  const [paymentType, setPaymentType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userWallet, setUserWallet] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [embeddedPayment, setEmbeddedPayment] = useState<{
    amount: number;
    reference: string;
    centerId: number;
    productIds: number[];
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error(t("login_required"));
      const redirect = encodeURIComponent(window.location.pathname);
      const locale = window.location.pathname.split("/").filter(Boolean)[0] || "en";
      window.location.href = `/${locale}/login?redirect=${redirect}`;
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const profile = await fetchUserProfile(token);
        if (!cancelled) setUserWallet(Number(profile?.wallet ?? 0));
      } catch {
        if (!cancelled) setUserWallet(0);
      } finally {
        if (!cancelled) setLoadingWallet(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const isWalletSufficient = userWallet !== null && userWallet >= total;
  const isWalletDisabled = userWallet === null || !isWalletSufficient;

  const handlePay = async () => {
    if (!isProductPaymentType(paymentType) || checkoutItems.length === 0) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error(t("login_required"));
      return;
    }

    setSubmitting(true);
    try {
      const outcome = await purchaseProductsWithPayment({
        token,
        centerId,
        items: checkoutItems,
        paymentType,
      });

      if (!outcome.ok) {
        const msg =
          outcome.code === "insufficient_balance"
            ? t("insufficient_balance")
            : outcome.message.startsWith("product_") || outcome.message.startsWith("payment_")
              ? t(outcome.message)
              : outcome.message;
        toast.error(msg || t("product_purchase_failed"));
        return;
      }

      if ("needsEmbeddedPayment" in outcome && outcome.needsEmbeddedPayment) {
        setEmbeddedPayment({
          amount: outcome.amount,
          reference: outcome.customerReference,
          centerId: outcome.centerId,
          productIds: outcome.productIds,
        });
        return;
      }

      clearCenter(centerId);
      toast.success(outcome.message || t("product_purchase_success"));
      router.push("/global-products");
    } catch {
      toast.error(t("product_purchase_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7F5F1] pt-24 pb-20">
        <Container className="max-w-3xl">
          <Link
            href="/global-products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#225D5C] hover:underline"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {t("global_products")}
          </Link>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#225D5C]">
            {t("cart_checkout")}
          </h1>
          {centerName && (
            <p className="mt-1 text-sm text-gray-500">
              {t("product_from_center")} {centerName}
            </p>
          )}

          {checkoutItems.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-[#225D5C]/30 bg-white p-12 text-center">
              <p className="font-medium text-gray-900">{t("cart_empty")}</p>
              <Button className="mt-6" onClick={() => router.push("/global-products")}>
                {t("global_products")}
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {t("order_summary")}
                </h2>
                <ul className="mt-4 space-y-3">
                  {checkoutItems.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center gap-3 rounded-xl bg-[#F7F5F1] p-3"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-200">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.price)}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-500"
                        aria-label={t("cart_remove")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
                  <span>{t("activity_total")}</span>
                  <span className="text-[#225D5C]">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {t("payment_method")}
                </h2>
                <div className="mt-4 grid gap-3">
                  {[
                    {
                      id: "wallet" as ProductPaymentType,
                      label: t("wallet"),
                      icon: Wallet,
                      description: loadingWallet
                        ? t("loading_balance")
                        : `${t("current_balance")}: ${formatPrice(userWallet ?? 0)}`,
                      disabled: loadingWallet || isWalletDisabled,
                    },
                    {
                      id: "service_visa" as ProductPaymentType,
                      label: t("service_visa"),
                      icon: CreditCard,
                      description: t("booking_secure_online_payment"),
                      disabled: false,
                    },
                  ].map((method) => {
                    const Icon = method.icon;
                    const selected = paymentType === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        disabled={method.disabled}
                        onClick={() => !method.disabled && setPaymentType(method.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
                          selected
                            ? "border-[#225D5C] bg-[#225D5C]/5"
                            : "border-gray-200 bg-white hover:border-gray-300",
                          method.disabled && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Icon size={20} className={selected ? "text-[#225D5C]" : "text-gray-500"} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{method.label}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{method.description}</p>
                          {method.id === "wallet" && !loadingWallet && !isWalletSufficient && (
                            <p className="mt-1 text-[11px] font-medium text-red-500">
                              {t("insufficient_balance")}
                            </p>
                          )}
                        </div>
                        {selected && <CheckCircle2 size={18} className="text-[#225D5C]" />}
                      </button>
                    );
                  })}
                </div>

                <Button
                  className="mt-6 w-full"
                  disabled={
                    submitting ||
                    !isProductPaymentType(paymentType) ||
                    (paymentType === "wallet" && isWalletDisabled)
                  }
                  onClick={() => void handlePay()}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      {t("booking_processing")}
                    </>
                  ) : (
                    t("cart_pay_now")
                  )}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </div>

      {embeddedPayment && (
        <MyFatoorahEmbeddedPayment
          modal
          open
          active
          amount={embeddedPayment.amount}
          currency="AED"
          customerReference={embeddedPayment.reference}
          centerId={embeddedPayment.centerId}
          title={t("cart_checkout")}
          subtitle={t("booking_secure_online_payment")}
          onClose={() => setEmbeddedPayment(null)}
          onPaymentComplete={() => {
            void (async () => {
              const token = localStorage.getItem("authToken");
              if (!token) {
                toast.error(t("login_required"));
                setEmbeddedPayment(null);
                return;
              }
              const result = await finalizeProductPurchaseAfterPayment({
                token,
                centerId: embeddedPayment.centerId,
                productIds: embeddedPayment.productIds,
              });
              setEmbeddedPayment(null);
              if (!result.success) {
                toast.error(result.message || t("product_purchase_failed"));
                return;
              }
              clearCenter(embeddedPayment.centerId);
              toast.success(t("product_purchase_success"));
              router.push("/global-products");
            })();
          }}
          onPaymentFailed={(msg) => toast.error(msg)}
        />
      )}
    </>
  );
}
