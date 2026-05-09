export const API_BASE_URL ="http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    CENTERS: `${API_BASE_URL}/center_api/centers`,
    GLOBAL_CATEGORIES: `${API_BASE_URL}/center_api/global-categories`,
    CENTER_BY_ID: (id: string | number) => `${API_BASE_URL}/center_api/centers/${id}`,
    REGISTER: `${API_BASE_URL}/center_api/auth/register`,
    LOGIN: `${API_BASE_URL}/center_api/auth/login`,
    USER_REGISTER: `${API_BASE_URL}/app_api/auth/register`,
    USER_LOGIN: `${API_BASE_URL}/app_api/auth/login`,
    USER_PROFILE: `${API_BASE_URL}/app_api/auth/profile`,
    USER_SOCIAL_LOGIN: `${API_BASE_URL}/app_api/auth/social-login`,
    USER_UPDATE_PROFILE: `${API_BASE_URL}/app_api/auth/update-profile`,
    STORE_BOOKING: `${API_BASE_URL}/app_api/booking/store`,
    STORE_PACKAGES: (centerId: string | number) => `${API_BASE_URL}/app_api/packages/store/${centerId}`,
    USER_PACKAGES_ALL: `${API_BASE_URL}/app_api/packages`,
    USER_PACKAGES: (centerId: string | number) => `${API_BASE_URL}/app_api/packages/${centerId}`,
    BOOKING_LIST: `${API_BASE_URL}/app_api/booking/list`,
    INFO: `${API_BASE_URL}/app_api/info`,
};

/** Single line item on a user booking (from booking list API). */
export interface BookingListService {
    name: string;
    worker_name: string;
    price: number;
    from_time: string;
    to_time: string;
    booking_source: string;
    image?: string;
    worker_image?: string;
}

export interface BookingListBranch {
    id: number;
    name: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
}

export interface BookingListItem {
    center_id: number;
    center_name: string;
    center_domain: string;
    center_logo?: string | null;
    center_primary_images?: string[] | null;
    id: number;
    booking_date: string;
    full_name: string;
    mobile: string;
    payment_type: string;
    total_price: number;
    branch: BookingListBranch;
    services: BookingListService[];
    booking_status: string;
    created_at: string;
}

export interface BookingListResponse {
    message: string;
    data: {
        bookings: BookingListItem[];
    };
}

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

export interface PackageServiceEntry {
    id: number;
    service: Service;
    created_at: string;
}

export interface CenterPackage {
    id: number;
    name: string;
    price: string;
    ServicePaid: PackageServiceEntry[];
    ServiceFree: PackageServiceEntry[];
    created_at: string;
}

export interface UserPurchasedPackage {
    id: number;
    package_id: number;
    package_name: string;
    price: number | string;
    status: string;
    package_type: string;
    created_at: string;
    used_packages?: UserPackageUsage[];
    package_details?: CenterPackage;
    center?: {
        id: number;
        name: string;
        domain: string;
        logo?: string | null;
    };
}

export interface UserPackageUsage {
    id: number;
    user_id: number;
    user_package_id: number;
    booking_id: number;
    service_id: number;
    service_name: string;
    is_free: boolean;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    keywords: string;
    services: Service[];
}

/** Global category (treatments) from center API. */
export interface GlobalCategory {
    id: number;
    name: string;
    slug: string;
}

export interface GlobalCategoriesResponse {
    message: string;
    data: GlobalCategory[];
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
    packages?: CenterPackage[];
    global_categories?: GlobalCategory[];
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
