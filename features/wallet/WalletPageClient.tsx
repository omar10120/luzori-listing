"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AccountSidebar from "@/components/account/AccountSidebar";
import Container from "@/components/ui/Container";
import MyFatoorahEmbeddedPayment from "@/components/payment/MyFatoorahEmbeddedPayment";
import { buyWalletTopUp, fetchUserProfile } from "@/lib/api";
import { isMyFatoorahPaymentSuccess } from "@/lib/myfatoorah";
import type { MyFatoorahPaymentCallbackPayload } from "@/lib/myfatoorah";

interface WalletUser {
    name?: string;
    wallet?: number | string;
}

type TopUpStep = "amount" | "payment";

export default function WalletPageClient() {
    const t = useTranslations();
    const router = useRouter();
    const [user, setUser] = useState<WalletUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [topUpOpen, setTopUpOpen] = useState(false);
    const [topUpStep, setTopUpStep] = useState<TopUpStep>("amount");
    const [topUpAmount, setTopUpAmount] = useState("");
    const [paymentCheckoutKey, setPaymentCheckoutKey] = useState(0);
    const [creditingWallet, setCreditingWallet] = useState(false);

    const loadProfile = useCallback(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
            return null;
        }
        const data = await fetchUserProfile(token);
        if (!data) {
            localStorage.removeItem("authToken");
            router.push("/login");
            return null;
        }
        setUser(data);
        return data;
    }, [router]);

    useEffect(() => {
        void (async () => {
            await loadProfile();
            setLoading(false);
        })();
    }, [loadProfile]);

    const walletBalance = Number(user?.wallet ?? 0);
    const parsedAmount = Number(topUpAmount);
    const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

    const formatMoney = (value: number) =>
        new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
        }).format(value);

    const closeTopUp = () => {
        setTopUpOpen(false);
        setTopUpStep("amount");
        setTopUpAmount("");
    };

    const openAddCard = () => {
        setTopUpStep("amount");
        setTopUpAmount("");
        setTopUpOpen(true);
    };

    const proceedToPayment = () => {
        if (!isValidAmount) {
            toast.error(t("wallet_enter_valid_amount"));
            return;
        }
        setPaymentCheckoutKey((k) => k + 1);
        setTopUpStep("payment");
    };

    const handlePaymentComplete = async (payload: MyFatoorahPaymentCallbackPayload) => {
        if (!isMyFatoorahPaymentSuccess(payload)) {
            toast.error(t("payment_failed"));
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
            return;
        }

        setCreditingWallet(true);
        const result = await buyWalletTopUp(token, parsedAmount);
        setCreditingWallet(false);

        if (!result.success) {
            toast.error(result.message || t("wallet_topup_failed"));
            return;
        }

        await loadProfile();
        toast.success(result.message || t("wallet_topup_success"));
        closeTopUp();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-[#225D5C]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <Container>
                <div className="flex flex-col gap-12 lg:flex-row">
                    <AccountSidebar userName={user?.name} />

                    <div className="flex-1 max-w-2xl">
                        <h1 className="mb-8 text-2xl font-bold text-gray-900">{t("wallet")}</h1>

                        {/* Balance card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#f8e7d1] to-[#d4c4b8] p-8 text-black shadow-lg">
                            <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                                {formatMoney(walletBalance)}
                            </p>
                            <p className="mt-2 text-sm font-medium text-black/90">
                                {t("wallet_balance_label")}
                            </p>

                            <button
                                type="button"
                                disabled
                                className="mt-8 inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-black/80 px-5 py-2.5 text-sm font-semibold text-black opacity-60"
                                title={t("wallet_gift_card_coming_soon")}
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-black">
                                    <Plus size={12} strokeWidth={3} />
                                </span>
                                {t("wallet_add_gift_card")}
                            </button>
                        </div>

                        {/* Cards section */}
                        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">{t("wallet_cards")}</h2>

                            <button
                                type="button"
                                onClick={openAddCard}
                                className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left transition hover:border-gray-200 hover:bg-gray-50"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                                    <Image
                                        src="/card.svg"
                                        alt=""
                                        width={28}
                                        height={28}
                                        className="object-contain"
                                    />
                                </span>
                                <span className="flex-1 text-base font-medium text-gray-900">
                                    {t("wallet_add_debit_credit")}
                                </span>
                                <ChevronRight size={20} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Amount step modal */}
            {topUpOpen && topUpStep === "amount" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900">{t("wallet_add_funds")}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t("wallet_add_funds_hint")}</p>

                        <label className="mt-6 block text-sm font-semibold text-gray-700">
                            {t("wallet_amount_label")}
                        </label>
                        <div className="relative mt-2">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                                AED
                            </span>
                            <input
                                type="number"
                                min={1}
                                step="0.01"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-12 w-full rounded-xl border border-gray-200 pl-14 pr-4 text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#225D5C]/30"
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={closeTopUp}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={proceedToPayment}
                                disabled={!isValidAmount}
                                className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                            >
                                {t("continue")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment portal */}
            {topUpOpen && topUpStep === "payment" && isValidAmount && (
                <>
                    {creditingWallet && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40">
                            <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl">
                                <Loader2 className="h-6 w-6 animate-spin text-[#225D5C]" />
                                <span className="text-sm font-medium text-gray-700">
                                    {t("wallet_crediting")}
                                </span>
                            </div>
                        </div>
                    )}
                    <MyFatoorahEmbeddedPayment
                        key={paymentCheckoutKey}
                        modal
                        open
                        active
                        amount={parsedAmount}
                        currency="AED"
                        customerReference={`wallet-topup-${Math.random().toString(36).substring(2, 15)}`}
                        title={t("wallet_add_debit_credit")}
                        subtitle={t("booking_secure_online_payment")}
                        onClose={() => setTopUpStep("amount")}
                        onPaymentComplete={(payload) => void handlePaymentComplete(payload)}
                        onPaymentFailed={(msg) => toast.error(msg)}
                    />
                </>
            )}
        </div>
    );
}
