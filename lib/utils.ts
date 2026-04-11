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
