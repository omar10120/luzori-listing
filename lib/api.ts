'use server'
import {
    API_ENDPOINTS,
    CenterResponse,
    CenterDetailResponse,
    CenterDetailData,
    BookingListResponse,
    BookingListItem,
    UserPurchasedPackage,
    CenterListResponse
} from "./apiEndpoints";
import { Business, CenterRate, } from "./types";

/**
 * Maps API center data to the application's Business interface.
 * Since the API response is missing some UI-specific fields (rating, location details),
 * we provide reasonable fallbacks to maintain the UI's premium look.
 */
const mapCenterToBusiness = (item: CenterResponse["data"][number]): Business => {
    return {
        id: item.id.toString(),
        name: item.name,
        location: item.domain || "Local Area", // Fallback for domain
        category: "Selfcare Service", // Default category since not in API
        rating: 4.8, // Fallback rating
        reviewCount: 120, // Fallback review count
        image: (item.primary_images && item.primary_images.length > 0) ? item.primary_images[0] : item.logo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
        isNew: item.rate === "new_to",
        isTrending: item.rate === "trending",
    };
};

export const fetchCenters = async (rate: CenterRate): Promise<Business[]> => {
    try {
        const response = await fetch(`${API_ENDPOINTS.CENTERS}?rate=${rate}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch centers: ${response.statusText}`);
        }

        const json: CenterListResponse = await response.json();

        // ✅ Access the nested array
        const centers = json.data?.data ?? [];
        if (!Array.isArray(centers)) {
            console.error("API Error: data.data is not an array", json);
            return [];
        }

        return centers.map(mapCenterToBusiness);
    } catch (error) {
        console.error("Fetch Centers Error:", error);
        return [];
    }
};

export const registerCenter = async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_ENDPOINTS.REGISTER}`, {
            method: "POST",
            body: formData,

        });

        const json = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Registration failed",
            };
        }

        return {
            success: true,
            message: json.message || "Registered successfully",
        };
    } catch (error) {
        console.error("Registration Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during registration",
        };
    }
};

const logFormData = (formData: FormData) => {
    const obj: Record<string, any> = {};
    formData.forEach((value, key) => {
        obj[key] = value;
    });
    console.log("FormData contents:", obj);
};

export const registerUser = async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    try {
        console.log("payload " + logFormData(formData));

        const response = await fetch(`${API_ENDPOINTS.USER_REGISTER}`, {
            method: "POST",
            body: formData,
        });

        const json = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Registration failed",
            };
        }

        return {
            success: true,
            message: json.message || "Registered successfully",
        };
    } catch (error) {
        console.error("User Registration Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during registration",
        };
    }
};

export const loginUser = async (credentials: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await fetch(API_ENDPOINTS.USER_LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const json = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Login failed",
            };
        }

        return {
            success: true,
            message: json.message || "Logged in successfully",
            data: json.data,
        };
    } catch (error) {
        console.error("User Login Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during login",
        };
    }
};

export const buyWalletTopUp = async (
    token: string,
    amount: number
): Promise<{ success: boolean; message?: string; data?: unknown }> => {
    try {
        const response = await fetch(API_ENDPOINTS.WALLET_BUY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: JSON.stringify({ amount }),
        });

        const json = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Failed to update wallet balance",
            };
        }

        return {
            success: true,
            message: json.message,
            data: json.data,
        };
    } catch (error) {
        console.error("Wallet buy error:", error);
        return {
            success: false,
            message: "An unexpected error occurred while updating your wallet",
        };
    }
};

export const fetchUserProfile = async (token: string): Promise<any> => {
    try {
        const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) return null;
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        return null;
    }
};

export const fetchBookingsList = async (token: string): Promise<BookingListItem[]> => {
    try {
        const response = await fetch(API_ENDPOINTS.BOOKING_LIST, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (!response.ok) return [];
        const json: BookingListResponse = await response.json();
        return Array.isArray(json.data?.bookings) ? json.data.bookings : [];
    } catch (error) {
        console.error("Fetch bookings list error:", error);
        return [];
    }
};

export const updateUserProfile = async (token: string, formData: FormData): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await fetch(API_ENDPOINTS.USER_UPDATE_PROFILE, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: formData,
        });

        const json = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Update failed",
                data: json.errors || json,
            };
        }

        return {
            success: true,
            message: json.message || "Profile updated successfully",
            data: json.data,
        };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during profile update",
        };
    }
};

export const loginWithProvider = async (provider: string, token: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await fetch(API_ENDPOINTS.USER_SOCIAL_LOGIN, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider,
                token
            }),
        });

        const json = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Social login failed",
            };
        }

        return {
            success: true,
            // the user provided example shows token in json.authorisation.token or json.data.token
            // we will return the whole json payload properly
            message: json.message || "Logged in successfully",
            data: json.data || json, // Try standard data wrapper, fallback to root json if Laravel does top-level
        };
    } catch (error) {
        console.error("Social Login Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during social login",
        };
    }
};

export const loginCenter = async (credentials: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });
        console.log("login" + JSON.stringify(credentials));

        if (!response.ok) {
            const text = await response.text();
            console.error("Login Error Response:", response.status, text);
            return {
                success: false,
                message: `Server Error (${response.status}): ${response.statusText}`,
            };
        }

        const json = await response.json();

        return {
            success: true,
            message: json.message || "Logged in successfully",
            data: json.data,
        };
    } catch (error) {
        console.error("Login Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during login",
        };
    }
};

export const fetchCenterById = async (id: string | number): Promise<CenterDetailData | null> => {
    try {
        const response = await fetch(API_ENDPOINTS.CENTER_BY_ID(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Fetch Center Detail Error:", response.status, response.statusText);
            return null;
        }

        const json: CenterDetailResponse = await response.json();
        return json.data;
    } catch (error) {
        console.error("Fetch Center Detail Error:", error);
        return null;
    }
};

export const storeBooking = async (token: string, bookingData: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        console.log("Store Booking Payload:", JSON.stringify(bookingData));
        const response = await fetch(API_ENDPOINTS.STORE_BOOKING, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: JSON.stringify(bookingData),
        });

        const json = await response.json();
        console.log("Store Booking Response:", JSON.stringify(json));
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Booking failed",
                data: json.errors || json,
            };
        }

        return {
            success: true,
            message: json.message || "Booking created successfully",
            data: json.data,
        };
    } catch (error) {
        console.error("Store Booking Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during booking",
        };
    }
};

export const storePackages = async (
    token: string,
    centerId: string | number,
    packageIds: number[],
    paymentType: string = "cash"
): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await fetch(API_ENDPOINTS.STORE_PACKAGES(centerId), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
            body: JSON.stringify({
                packages: packageIds.map((id) => ({ id })),
                payment_type: paymentType,
            }),
        });

        const json = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Package purchase failed",
                data: json.errors || json,
            };
        }

        return {
            success: true,
            message: json.message || "Package purchased successfully",
            data: json.data,
        };
    } catch (error) {
        console.error("Store Packages Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during package purchase",
        };
    }
};

export const fetchUserPurchasedPackages = async (
    token: string,
    centerId: string | number
): Promise<UserPurchasedPackage[]> => {
    try {
        const response = await fetch(API_ENDPOINTS.USER_PACKAGES(centerId), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });
        if (!response.ok) return [];
        const json = await response.json();
        // API returns paginated response: { data: { data: [...] } }
        const items = json?.data?.data ?? json?.data;
        return Array.isArray(items) ? items : [];
    } catch (error) {
        console.error("Fetch User Packages Error:", error);
        return [];
    }
};

export const fetchUserPackages = async (token: string): Promise<UserPurchasedPackage[]> => {
    try {
        const response = await fetch(API_ENDPOINTS.USER_PACKAGES_ALL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });
        if (!response.ok) return [];
        const json = await response.json();
        // API returns paginated response: { data: { data: [...] } }
        const items = json?.data?.data ?? json?.data;
        return Array.isArray(items) ? items : [];
    } catch (error) {
        console.error("Fetch User Packages (all) Error:", error);
        return [];
    }
};

/**
 * Creates a fresh MyFatoorah embedded session (single-use SessionId).
 * Laravel proxies POST /center_api/payment/create-session.
 */
export const createPaymentSession = async (
    token: string,
    input: import("./myfatoorah").CreatePaymentSessionInput
): Promise<{
    success: boolean;
    sessionId?: string;
    sessionData?: import("./myfatoorah").MyFatoorahSessionData;
    message?: string;
}> => {
    try {

        const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_SESSION, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: JSON.stringify({
                amount: input.amount,
                currency: input.currency ?? "AED",
                customer_reference: input.customer_reference,
                center_id: input.center_id,
                ...input.metadata,
            }),
        });

        const json = (await response.json()) as import("./myfatoorah").CreatePaymentSessionApiResponse;

        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Failed to create payment session",
            };
        }

        const inner = json.data;
        if (!inner?.IsSuccess || !inner.Data?.SessionId) {
            return {
                success: false,
                message: inner?.Message || json.message || "Failed to create payment session",
            };
        }

        return {
            success: true,
            sessionId: inner.Data.SessionId,
            sessionData: inner.Data,
        };
    } catch (error) {
        console.error("Create Payment Session Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred while starting payment",
        };
    }
};

export const fetchInfo = async (): Promise<import("./apiEndpoints").InfoData | null> => {
    try {
        const response = await fetch(API_ENDPOINTS.INFO, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            cache: 'no-store'
        });

        if (!response.ok) return null;
        const json: import("./apiEndpoints").InfoResponse = await response.json();
        return json.data;
    } catch (error) {
        console.error("Fetch Info Error:", error);
        return null;
    }
};
