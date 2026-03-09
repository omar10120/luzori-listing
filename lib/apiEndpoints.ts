import { CenterRate } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.dashboard.luzori.com";

export const API_ENDPOINTS = {
    CENTERS: `${API_BASE_URL}/center_api/centers`,
    REGISTER: `${API_BASE_URL}/center_api/auth/register`,
    LOGIN: `${API_BASE_URL}/center_api/auth/login`,
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
