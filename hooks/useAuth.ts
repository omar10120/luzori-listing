"use client";

import { useState, useEffect } from "react";

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
}

export function useAuth(): AuthState {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        token: null,
    });

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("authToken");
            setAuthState({
                isAuthenticated: !!token,
                isLoading: false,
                token,
            });
        };

        // Check on mount
        checkAuth();

        // Optional: Listen for cross-tab auth changes
        window.addEventListener("storage", checkAuth);

        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    return authState;
}
