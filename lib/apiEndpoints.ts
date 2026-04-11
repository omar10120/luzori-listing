import { CenterRate } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    CENTERS: `${API_BASE_URL}/center_api/centers`,
    CENTER_BY_ID: (id: string | number) => `${API_BASE_URL}/center_api/centers/${id}`,
    REGISTER: `${API_BASE_URL}/center_api/auth/register`,
    LOGIN: `${API_BASE_URL}/center_api/auth/login`,
    USER_REGISTER: `${API_BASE_URL}/app_api/auth/register`,
    USER_LOGIN: `${API_BASE_URL}/app_api/auth/login`,
    USER_PROFILE: `${API_BASE_URL}/app_api/auth/profile`,
    USER_SOCIAL_LOGIN: `${API_BASE_URL}/app_api/auth/social-login`,
    USER_UPDATE_PROFILE: `${API_BASE_URL}/app_api/auth/update-profile`,
    STORE_BOOKING: `${API_BASE_URL}/app_api/booking/store`,
    INFO: `${API_BASE_URL}/app_api/info`,
};

export interface Branch {
    id: number;
    name: string;
    city: string;
    address: string;
    longitude: string;
    latitude: string;
}

export interface WorkerVacation {
    id: number;
    day: string;
    describe?: string | null;
}

export interface Worker {
    id: number;
    name: string;
    image: string;
    has_commission: number;
    branch_id: number;
    vacations?: WorkerVacation[];
}

export interface Service {
    id: number;
    name: string;
    description: string;
    price: number | string;
    rooms_no?: number;
    max_time?: string | null;
    extra_time?: string | null;
    is_top: boolean;
    image: string;
    duration?: string; // For UI compatibility if needed
    workers?: Worker[];
}

export interface Category {
    id: number;
    name: string;
    description: string;
    keywords: string;
    services: Service[];
}

export interface CenterDetailData {
    id: number;
    name: string;
    domain: string;
    status: string;
    logo: string;
    primary_images: string[];
    rate: string | null;
    created_at: string;
    branches: Branch[];
    categories: Category[];
    services: Service[]; // Root level services if any
}

export interface CenterDetailResponse {
    message: string;
    data: CenterDetailData;
}

export interface CenterResponse {
    message: string;
    data: CenterDetailData[];
}

export interface InfoContent {
    ar: string;
    en: string;
}

export interface InfoData {
    privacy_policy: InfoContent;
    terms_of_use: InfoContent;
    terms_of_service: InfoContent;
    about_us: InfoContent;
}

export interface InfoResponse {
    status: boolean;
    data: InfoData;
}
