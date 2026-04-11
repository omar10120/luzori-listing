import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** True when API user object has a usable mobile number (at least 8 digits). */
export function hasValidUserPhone(user: Record<string, unknown> | null | undefined): boolean {
    if (!user) return false;
    const raw = user.phone;
    if (raw === null || raw === undefined) return false;
    const digits = String(raw).replace(/\D/g, "");
    return digits.length >= 8;
}

/** Laravel-style token on `data.token` or `data.authorisation.token`. */
export function extractSanctumTokenFromApiPayload(
    data: Record<string, unknown> | undefined
): string | undefined {
    if (!data) return undefined;
    const token = data.token;
    if (typeof token === "string" && token) return token;
    const authBlock = data.authorisation as Record<string, unknown> | undefined;
    const nested = authBlock?.token;
    if (typeof nested === "string" && nested) return nested;
    return undefined;
}

export function persistAuthTokenIfPresent(data: unknown): void {
    if (typeof window === "undefined") return;
    const tok = extractSanctumTokenFromApiPayload(data as Record<string, unknown>);
    if (tok) localStorage.setItem("authToken", tok);
}
