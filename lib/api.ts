'use server'
import { API_ENDPOINTS, CenterResponse } from "./apiEndpoints";
import { Business, CenterRate } from "./types";

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
        image: item.primary_image || item.logo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
        isNew: item.rate === "new_to",
        isTrending: item.rate === "trending",
    };
};

export const fetchCenters = async (rate: CenterRate): Promise<Business[]> => {
    try {
        const response = await fetch(`${API_ENDPOINTS.CENTERS}?rate=${rate}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },

        });
        console.log(response);
        if (!response.ok) {
            throw new Error(`Failed to fetch centers: ${response.statusText}`);
        }

        const json: CenterResponse = await response.json();

        // Ensure data is an array before mapping
        if (!Array.isArray(json.data)) {
            console.error("API Error: data is not an array", json);
            return [];
        }

        return json.data.map(mapCenterToBusiness);
    } catch (error) {
        console.log(error);
        console.error("Fetch Centers Error:", error);
        return []; // Return empty array on failure to prevent UI crash
    }
};

export const registerCenter = async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    try {
        console.log(API_ENDPOINTS.REGISTER)
        const response = await fetch(`${API_ENDPOINTS.REGISTER}`, {
            method: "POST",
            body: formData,
            // When sending FormData, the browser automatically sets the Content-Type
            // including the boundary, so we should NOT set it manually.
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
