"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
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
    const { loading, needsPhone, profile, refetch } = useRequirePhone(true);

    const recheck = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const ctx = useMemo(() => recheck, [recheck]);

    return (
        <PhoneRecheckContext.Provider value={ctx}>
            {children}
            {!loading && needsPhone && (
                <PhoneRequiredDialog
                    open
                    profile={profile}
                    copyVariant="session"
                    onAfterSaveSuccess={() => void refetch()}
                    onSignOutComplete={() => void refetch()}
                />
            )}
        </PhoneRecheckContext.Provider>
    );
}
