import { CenterRate } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    CENTERS: `${API_BASE_URL}/center_api/centers`,
};

export interface CenterRequestParams {
    rate: CenterRate;
}

export interface CenterResponse {
    message: string;
    data: Array<{
        id: number;
        name: string;
        domain: string;
        status: string;
        logo: string;
        primary_image: string;
        rate: CenterRate;
        created_at: string;
    }>;
}
