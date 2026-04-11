"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUserProfile } from "@/lib/api";
import { hasValidUserPhone } from "@/lib/utils";

export type UseRequirePhoneResult = {
    loading: boolean;
    needsPhone: boolean;
    profile: Record<string, unknown> | null;
    refetch: () => Promise<void>;
};

/**
 * When an auth token exists, loads the user profile and sets `needsPhone` if the API
 * has no usable phone (e.g. Google-created account). Re-run after login or when the
 * user returns to the tab so a closed page does not skip the prompt.
 */
export function useRequirePhone(enabled = true): UseRequirePhoneResult {
    const [loading, setLoading] = useState(true);
    const [needsPhone, setNeedsPhone] = useState(false);
    const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

    const refetch = useCallback(async () => {
        if (!enabled || typeof window === "undefined") {
            setLoading(false);
            setNeedsPhone(false);
            setProfile(null);
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            setProfile(null);
            setNeedsPhone(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const p = await fetchUserProfile(token);
            setProfile(p);
            setNeedsPhone(!hasValidUserPhone(p));
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") void refetch();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [refetch]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "authToken") void refetch();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [refetch]);

    return { loading, needsPhone, profile, refetch };
}
