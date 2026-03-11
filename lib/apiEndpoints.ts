import { CenterRate } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.dashboard.luzori.com";

export const API_ENDPOINTS = {
    CENTERS: `${API_BASE_URL}/center_api/centers`,
    CENTER_BY_ID: (id: string | number) => `${API_BASE_URL}/center_api/centers/${id}`,
    REGISTER: `${API_BASE_URL}/center_api/auth/register`,
    LOGIN: `${API_BASE_URL}/center_api/auth/login`,
};

export interface CenterRequestParams {
    rate: CenterRate;
}

export interface CenterDetailData {
    id: number;
    name: string;
    domain: string;
    status: string;
    logo: string;
    primary_images: string[];
    rate: CenterRate | null;
    created_at: string;
}

export interface CenterDetailResponse {
    message: string;
    data: CenterDetailData;
}

export interface CenterResponse {
    message: string;
    data: Array<{
        id: number;
        name: string;
        domain: string;
        status: string;
        logo: string;
        primary_images: string[];
        rate: CenterRate;
        created_at: string;
    }>;
}
