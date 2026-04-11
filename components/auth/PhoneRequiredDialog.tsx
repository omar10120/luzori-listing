"use client";

import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchUserProfile, updateUserProfile } from "@/lib/api";
import { hasValidUserPhone } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";

export type PhoneRequiredCopyVariant = "google" | "session";

function splitDisplayName(displayName: string | null | undefined): { first: string; last: string } {
    if (!displayName?.trim()) return { first: "", last: "" };
    const parts = displayName.trim().split(/\s+/);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
}

export type PhoneRequiredDialogProps = {
    open: boolean;
    profile: Record<string, unknown> | null;
    firebaseUser?: FirebaseUser | null;
    copyVariant?: PhoneRequiredCopyVariant;
    onAfterSaveSuccess?: () => void;
    onSignOutComplete?: () => void;
};

export default function PhoneRequiredDialog({
    open,
    profile,
    firebaseUser = null,
    copyVariant = "session",
    onAfterSaveSuccess,
    onSignOutComplete,
}: PhoneRequiredDialogProps) {
    const t = useTranslations();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState(
        String(profile?.country_code || "+971")
    );

    useEffect(() => {
        if (open && profile?.country_code) {
            setTimeout(() => {
                setCountryCode(String(profile.country_code));
            }, 0);
        }
    }, [open, profile?.country_code]);

    if (!open) return null;

    const bodyText =
        copyVariant === "google"
            ? t("phone_required_google")
            : t("phone_required_account");

    const handleSignOut = async () => {
        localStorage.removeItem("authToken");
        setPhone("");
        setError(null);
        try {
            await signOut(auth);
        } catch {
            /* ignore */
        }
        onSignOutComplete?.();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmed = phone.trim();
        if (!trimmed || trimmed.replace(/\D/g, "").length < 8) {
            setError(t("phone_invalid"));
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            setError(t("session_expired"));
            return;
        }

        const merged = profile ?? {};
        const fbNames = splitDisplayName(firebaseUser?.displayName);

        setSubmitting(true);
        const body = new FormData();
        body.append("first_name", String(merged.first_name ?? fbNames.first ?? ""));
        body.append("last_name", String(merged.last_name ?? fbNames.last ?? ""));
        body.append("email", String(merged.email ?? firebaseUser?.email ?? ""));
        body.append("phone", trimmed.replace(/\s/g, ""));
        body.append("country_code", countryCode);

        const result = await updateUserProfile(token, body);
        setSubmitting(false);

        if (result.success) {
            const refreshed = await fetchUserProfile(token);
            if (hasValidUserPhone(refreshed)) {
                setPhone("");
                onAfterSaveSuccess?.();
            } else {
                setError(t("phone_not_saved"));
            }
        } else {
            setError(result.message || t("update_failed"));
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="phone-required-title"
                className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
            >
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={t("close")}
                >
                    <X size={20} />
                </button>

                <h2 id="phone-required-title" className="pr-10 text-xl font-bold text-gray-900">
                    {t("phone_required_title")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{bodyText}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                            {t("mobile_number")}
                        </label>
                        <div className="flex gap-3">
                            <div className="relative w-28 shrink-0">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#623ce1]"
                                >
                                    <option value="+971">+971</option>
                                    <option value="+963">+963</option>
                                    <option value="+966">+966</option>
                                    <option value="+1">+1</option>
                                </select>
                                <ChevronDown
                                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={16}
                                />
                            </div>
                            <input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t("phone_placeholder")}
                                className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#623ce1]"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            {t("sign_out")}
                        </button>
                        <button
                            type="submit"
                            
                            disabled={submitting}
                            className="h-11 rounded-xl bg-[#225D5C] px-5 text-sm font-semibold text-white hover:bg-[#1a4a49] disabled:opacity-60"
                        >
                            {submitting ? <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </div> : t("save_and_continue")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
