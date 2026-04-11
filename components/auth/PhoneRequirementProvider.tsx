"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useLocale } from "next-intl";
import { useRequirePhone } from "@/hooks/useRequirePhone";
import PhoneRequiredDialog from "@/components/auth/PhoneRequiredDialog";

type RecheckFn = () => Promise<void>;

const PhoneRecheckContext = createContext<RecheckFn | undefined>(undefined);

/** Call after `authToken` is set (e.g. Google login) so the global phone gate re-runs immediately. */
export function usePhoneRequirementRefetch(): RecheckFn | undefined {
    return useContext(PhoneRecheckContext);
}

/**
 * If the user is logged in but has no valid phone on the profile, shows `PhoneRequiredDialog`.
 * Persists across navigation and tab visibility (see `useRequirePhone`).
 */
export function PhoneRequirementProvider({ children }: { children: React.ReactNode }) {
    const locale = useLocale();
    const { loading, needsPhone, profile, refetch } = useRequirePhone(true);

    const recheck = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const ctx = useMemo(() => recheck, [recheck]);

    const onPhoneConfirmed = useCallback(async () => {
        await refetch();
        window.location.assign(`/${locale}`);
    }, [refetch, locale]);

    return (
        <PhoneRecheckContext.Provider value={ctx}>
            {children}
            {!loading && needsPhone && (
                <PhoneRequiredDialog
                    open
                    profile={profile}
                    copyVariant="session"
                    onAfterSaveSuccess={onPhoneConfirmed}
                    onSignOutComplete={() => void refetch()}
                />
            )}
        </PhoneRecheckContext.Provider>
    );
}
