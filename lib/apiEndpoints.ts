export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    CENTERS: `${API_BASE_URL}/center_api/centers`,
    /** Rate/list payloads skip workers — load them from CENTER_WORKERS. */
    CENTER_LIST_INCLUDE: "global_categories,branches,categories,services,packages,about_us,vacations",
    GLOBAL_CATEGORIES: `${API_BASE_URL}/center_api/global-categories`,
    CENTER_BY_ID: (id: string | number) => `${API_BASE_URL}/center_api/centers/${id}?include=global_categories,branches,categories,services,packages,about_us,workers,vacations`,
    CENTER_WORKERS: (id: string | number, page = 1, perPage = 20) =>
        `${API_BASE_URL}/center_api/centers/${id}/workers?page=${page}&per_page=${perPage}`,
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
    FAVORITES_TOGGLE: `${API_BASE_URL}/app_api/favorites/toggle`,
    FAVORITES: (page = 1, perPage = 20) =>
        `${API_BASE_URL}/app_api/favorites?include=reviews&page=${page}&per_page=${perPage}`,
    REVIEWS: `${API_BASE_URL}/app_api/reviews`,
    REVIEW_BY_ID: (id: string | number) => `${API_BASE_URL}/app_api/reviews/${id}`,
    CENTER_REVIEWS: (centerId: string | number, page = 1, perPage = 20) =>
        `${API_BASE_URL}/app_api/reviews/center/${centerId}?page=${page}&per_page=${perPage}`,
    MY_CENTER_REVIEW: (centerId: string | number) => `${API_BASE_URL}/app_api/reviews/${centerId}/mine`,
    GLOBAL_PRODUCTS: (page = 1, perPage = 30) =>
        `${API_BASE_URL}/app_api/global-products?page=${page}&per_page=${perPage}`,
    CENTER_PRODUCT: (centerId: string | number, productId: string | number) =>
        `${API_BASE_URL}/center_api/centers/${centerId}/products/${productId}`,
    BUY_PRODUCTS: `${API_BASE_URL}/app_api/buyproducts/add`,
    BUY_PRODUCTS_ALL: `${API_BASE_URL}/app_api/buyproducts/all`,
    CART: `${API_BASE_URL}/app_api/cart`,
    CART_PRODUCTS: `${API_BASE_URL}/app_api/cart/products`,
    CART_ITEM: (id: string | number) => `${API_BASE_URL}/app_api/cart/${id}`,
    CART_CLEAR: `${API_BASE_URL}/app_api/cart/clear`,
    CART_CHECKOUT_PAYLOAD: `${API_BASE_URL}/app_api/cart/checkout-payload`,
    INFO: `${API_BASE_URL}/app_api/info`,
    /** MyFatoorah Embedded V3 — Laravel creates a fresh single-use session */
    CREATE_PAYMENT_SESSION: `${API_BASE_URL}/app_api/payment/create-session`,
    WALLET_BUY: `${API_BASE_URL}/app_api/wallet/buy`,
};

/** Line item for POST /app_api/buyproducts/add */
export interface BuyProductLine {
    id: number;
    qty: number;
}

export type BuyProductPaymentType = "wallet" | "service_visa" | "sales_cash";

export interface BuyProductsPayload {
    center_id: number;
    branch_id: number;
    products: BuyProductLine[];
    payment_type: BuyProductPaymentType;
    sales_worker_id: number;
    worker_id: number | null;
    clear_cart?: boolean;
    cart_item_ids?: number[];
}

export interface BuyProductOrderProduct {
    id: number;
    product_id: number;
    name: string;
    price: number | string;
    /** Per-line sold qty when API sends it; otherwise group by product_id. */
    qty?: number;
    image_url?: string | null;
}

export interface BuyProductOrderCenter {
    id: number;
    name: string;
    domain?: string | null;
    logo?: string | null;
}

export interface BuyProductOrderWorker {
    id: number;
    name: string;
    image?: string | null;
    phone?: string | null;
    email?: string | null;
    branch?: {
        id: number;
        name: string;
        city?: string | null;
        address?: string | null;
    } | null;
}

export interface BuyProductOrder {
    id: number;
    payment_type: string;
    commission?: number | string | null;
    discount?: number | string | null;
    global_user_id?: number;
    sale_id?: number | null;
    /** Total sold quantity across the order. */
    qty: number;
    unit_price?: number | string | null;
    subtotal?: number | string | null;
    total: number | string;
    items_count?: number;
    products: BuyProductOrderProduct[];
    product_names?: string[];
    sales_worker?: BuyProductOrderWorker | null;
    worker?: BuyProductOrderWorker | null;
    center?: BuyProductOrderCenter | null;
    created_at: string;
}

export interface BuyProductOrdersPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

export interface BuyProductOrdersResponse {
    message: string;
    data: BuyProductOrder[];
    paginationData?: {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
        next_page_url?: string | null;
        prev_page_url?: string | null;
        first_page?: number;
        last_item?: number;
        first_item?: number;
    };
}

export interface ApiCartCenter {
    id: number;
    name: string;
    domain: string;
}

export interface ApiCartItem {
    id: number;
    center_id: number;
    center?: ApiCartCenter | null;
    branch_id: number;
    item_type: string;
    item_id: number;
    qty: number;
    name: string;
    sku?: string | null;
    image_url?: string | null;
    unit_price: number | string;
    total_price: number | string;
    request_payload?: BuyProductLine | null;
    booking?: unknown;
    created_at?: string;
    updated_at?: string;
}

export interface ApiCartListResponse {
    message: string;
    data: {
        items: ApiCartItem[];
        count: number;
        subtotal: number | string;
    };
}

export interface ApiCartCheckoutPayload {
    center_id: number;
    branch_id: number;
    products: BuyProductLine[];
    cart_item_ids: number[];
    subtotal: number | string;
}

export interface ApiCartCheckoutPayloadResponse {
    message: string;
    data: ApiCartCheckoutPayload;
}

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
    open_time: string;
    close_time: string;
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
    /** Backend sends 0/1 — treat falsy as "regular employee". */
    is_professional: number | boolean;
    email?: string | null;
    phone?: string | null;
    country_code?: string | null;
    branch_id: number;
    branch_name?: string | null;
    vacations?: WorkerVacation[];
}

export interface WorkersPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export interface CenterWorkersResponse {
    message: string;
    data: WorkersPagination & {
        data: Worker[];
    };
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
    nameAr: string;
    slug: string;
    image: string;
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
    avg_rating: string | null;
    reviews_count: number | null;
    created_at: string;
    branches: Branch[];
    categories: Category[];
    services: Service[]; // Root level services if any
    packages?: CenterPackage[];
    global_categories?: GlobalCategory[];
    is_favorite?: boolean;
}
export interface CenterListItem {
    id: number;
    name: string;
    domain: string;
    status: string;
    logo: string;
    primary_images: string[];
    rate: string | null;
    avg_rating: string | null;
    reviews_count: number | null;
    created_at: string;
    branches: Branch[];
    categories: Category[];
    services: Service[]; // Root level services if any
    packages?: CenterPackage[];
    global_categories?: GlobalCategory[];
}
export interface CenterListResponse {
    message: string;
    data: {
        current_page: number;
        data: CenterListItem[];   // <-- actual array is nested here
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}


export interface CenterDetailResponse {
    message: string;
    data: CenterDetailData;
}

export interface CenterResponse {
    message: string;
    data: CenterDetailData[];
}

export interface CenterReviewUser {
    id: number;
    name: string;
    image: string | null;
}

export interface CenterReview {
    id: number;
    center_id: number;
    rating: number;
    comment: string | null;
    user: CenterReviewUser;
    created_at: string;
    updated_at: string;
}

export interface CenterReviewsPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface CenterReviewsResponse {
    message: string;
    data: {
        center_id: number;
        avg_rating: number | string | null;
        reviews_count: number;
        reviews: CenterReview[];
        pagination: CenterReviewsPagination;
    };
}

export interface MyCenterReviewResponse {
    message: string;
    data: {
        center_id: number;
        has_review: boolean;
        review: CenterReview | null;
    };
}

export interface FavoriteCenterCategory {
    id: number;
    name: string;
    slug: string;
}

export interface FavoriteCenter {
    id: number;
    name: string;
    domain: string;
    status: string;
    rate: string | null;
    logo: string | null;
    primary_images: string[];
    global_categories: FavoriteCenterCategory[];
    is_favorite: boolean;
    favorited_at: string;
}

export interface FavoritesPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface FavoritesResponse {
    message: string;
    data: {
        favorites: FavoriteCenter[];
        pagination: FavoritesPagination;
    };
}

export interface GlobalProductSku {
    id: number;
    sku?: string | null;
    name?: string | null;
    price?: number | string | null;
    type?: string | null;
    order?: number;
}

export interface GlobalProductNested {
    id: number;
    details_available?: boolean;
    name: string;
    description?: string | null;
    barcode?: string | null;
    brand?: string | null;
    category?: string | null;
    measure_unit?: string | null;
    measure_amount?: number | string | null;
    supply_price?: number | string | null;
    // retail_price?: number | string | null;
    markup?: number | string | null;
    allow_retail_sales?: boolean;
    track_stock?: boolean;
    primary_sku?: GlobalProductSku | null;
    skus?: GlobalProductSku[];
    image_url?: string | null;
}

export interface GlobalProductListItem {
    id: number;
    center_id: number;
    center_name: string;
    center_domain: string;
    product_id: number;
    name: string;
    sort_order: number;
    product: GlobalProductNested;
}

export interface GlobalProductsPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface GlobalProductsResponse {
    message: string;
    data: {
        products: GlobalProductListItem[];
        pagination: GlobalProductsPagination;
    };
}

export interface CenterProductBranch {
    id: number;
    name: string;
    stock_quantity: number;
}

export interface CenterProductTranslation {
    locale: string;
    name: string;
    text?: string | null;
}

export interface CenterProductDetail {
    id: number;
    center_id: number;
    center_name: string;
    center_domain: string;
    name: string;
    text?: string | null;
    short_description?: string | null;
    barcode?: string | null;
    brand_id?: number | null;
    brand_name?: string | null;
    category_id?: number | null;
    category_name?: string | null;
    measure_unit?: string | null;
    measure_amount?: number | string | null;
    supply_price?: number | string | null;
    // retail_price?: number | string | null;
    markup?: number | string | null;
    allow_retail_sales?: boolean;
    track_stock?: boolean;
    image?: string | null;
    gallery?: string[];
    skus?: GlobalProductSku[];
    primary_sku?: GlobalProductSku | null;
    branches?: CenterProductBranch[];
    translations?: CenterProductTranslation[];
}

export interface CenterProductDetailResponse {
    message: string;
    data: CenterProductDetail;
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
