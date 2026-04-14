"use client";

import React, { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { loginWithProvider, fetchUserProfile } from "@/lib/api";
import { extractSanctumTokenFromApiPayload, hasValidUserPhone } from "@/lib/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePhoneRequirementRefetch } from "@/components/auth/PhoneRequirementProvider";

interface GoogleLoginButtonProps {
    className?: string;
    text?: string;
}

function mergeUserFromLoginAndProfile(
    apiData: Record<string, unknown> | undefined,
    profile: Record<string, unknown> | null
) {
    const nested =
        apiData?.user && typeof apiData.user === "object"
            ? (apiData.user as Record<string, unknown>)
            : {};
    return { ...nested, ...(profile || {}) };
}

export default function GoogleLoginButton({ className, text }: GoogleLoginButtonProps) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const t = useTranslations();
    const recheckPhone = usePhoneRequirementRefetch();

    const finishLoginRedirect = () => {
        const redirectTarget = new URLSearchParams(window.location.search).get("redirect") || "/";
        setTimeout(() => {
            window.location.href = redirectTarget;
        }, 400);
    };

    const handleGoogleLogin = async () => {
        let storedToken = false;
        try {
            setLoading(true);
            setErrorMsg(null);

            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken(true);

            const apiResult = await loginWithProvider("google", idToken);

            if (!apiResult.success) {
                setErrorMsg(apiResult.message || "Failed to authenticate with server");
                return;
            }

            const data = apiResult.data as Record<string, unknown> | undefined;
            const sanctumToken = extractSanctumTokenFromApiPayload(data);

            if (!sanctumToken) {
                setErrorMsg("Received invalid response from server");
                return;
            }

            localStorage.setItem("authToken", sanctumToken);
            storedToken = true;

            const profile = await fetchUserProfile(sanctumToken);
            const merged = mergeUserFromLoginAndProfile(data, profile);

            await recheckPhone?.();

            if (!hasValidUserPhone(merged)) {
                return;
            }

            finishLoginRedirect();
        } catch (error: unknown) {
            const err = error as { message?: string };
            setErrorMsg(err.message || "Failed to sign in with Google");
            if (storedToken) {
                localStorage.removeItem("authToken");
            }
            try {
                await signOut(auth);
            } catch {
                /* ignore */
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full flex-col">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={cn(
                    "flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-2 px-4 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
                    className
                )}
            >
                {loading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
                ) : (
                    <Image
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google logo"
                        width={20}
                        height={20}
                    />
                )}
                <span className="text-sm font-medium text-gray-700">
                    {loading ? t("signing_in") : text || t("continue_google")}
                </span>
            </button>
            {errorMsg && (
                <p className="mt-2 text-center text-xs font-medium text-red-500">{errorMsg}</p>
            )}
        </div>
    );
}
