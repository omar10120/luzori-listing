"use client";

import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { loginWithProvider } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface GoogleLoginButtonProps {
    className?: string;
    text?: string;
}

export default function GoogleLoginButton({ className, text }: GoogleLoginButtonProps) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();
    const t = useTranslations();

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            // 1. Show the Google Sign-In popup using Firebase
            const result = await signInWithPopup(auth, googleProvider);

            // 2. Extract the ID Token from the signed-in user
            const idToken = await result.user.getIdToken(true);
            console.log(idToken);

            // 3. Send the token to the Laravel API
            const apiResult = await loginWithProvider('google', idToken);

            if (apiResult.success) {
                // Determine token location from potential response formats
                const sanctumToken = apiResult.data?.token || apiResult.data?.authorisation?.token;

                if (sanctumToken) {
                    localStorage.setItem('authToken', sanctumToken);
                    console.log(sanctumToken);
                    // Redirect after success
                    setTimeout(() => { window.location.href = "/" }, 500);
                } else {
                    console.error("Token missing in response:", apiResult.data);
                    setErrorMsg("Received invalid response from server");
                }
            } else {
                console.error("Laravel API Error:", apiResult.message);
                console.log(apiResult);
                setErrorMsg(apiResult.message || "Failed to authenticate with server");
            }

        } catch (error: any) {
            console.error("Firebase Login Error:", error);
            console.log(error);
            setErrorMsg(error.message || "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-col">
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
                    <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" width={20} height={20} />
                )}
                <span className="text-sm font-medium text-gray-700">
                    {loading ? "Signing in..." : (text || "Continue with Google")}
                </span>
            </button>
            {errorMsg && (
                <p className="mt-2 text-center text-xs font-medium text-red-500">{errorMsg}</p>
            )}
        </div>
    );
}
