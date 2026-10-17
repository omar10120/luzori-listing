'use server'
import {
    API_CENTER_DOMAIN,
    API_ENDPOINTS,
    CenterResponse,
    CenterDetailResponse,
    CenterDetailData,
    BookingListResponse,
    BookingListItem,
    UserPurchasedPackage,
    CenterListResponse,
    CenterWorkersResponse,
    Worker,
    WorkersPagination,
    FavoriteCenter,
    FavoritesPagination,
    FavoritesResponse,
    CenterReview,
    CenterReviewsPagination,
    CenterReviewsResponse,
    MyCenterReviewResponse,
    GlobalProductListItem,
    GlobalProductsPagination,
    GlobalProductsResponse,
    CenterProductDetail,
    CenterProductDetailResponse,
    ApiCartItem,
    ApiCartListResponse,
    ApiCartCheckoutPayload,
    ApiCartCheckoutPayloadResponse,
    BuyProductOrder,
    BuyProductOrdersPagination,
    BuyProductOrdersResponse,
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
        rating: item.avg_rating, // Fallback rating
        reviewCount: item.reviews_count, // Fallback review count
        image: (item.primary_images && item.primary_images.length > 0) ? item.primary_images[0] : item.logo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
        isNew: item.rate === "new_to",
        isTrending: item.rate === "trending",
    };
};

export const fetchCenters = async (rate: CenterRate): Promise<Business[]> => {
    try {
        const response = await fetch(`${API_ENDPOINTS.CENTERS}?rate=${rate}&include=${API_ENDPOINTS.CENTER_LIST_INCLUDE}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                domain: API_CENTER_DOMAIN,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch centers: ${response.statusText}`);
        }

        const json: CenterListResponse = await response.json();


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

export const fetchCenterWorkers = async (
    centerId: string | number,
    page = 1,
    perPage = 20
): Promise<{ workers: Worker[]; pagination: WorkersPagination }> => {
    const emptyPagination: WorkersPagination = {
        current_page: page,
        last_page: 1,
        per_page: perPage,
        total: 0,
        next_page_url: null,
        prev_page_url: null,
    };

    try {
        const response = await fetch(API_ENDPOINTS.CENTER_WORKERS(centerId, page, perPage), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                domain: API_CENTER_DOMAIN,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Fetch Center Workers Error:", response.status, response.statusText);
            return { workers: [], pagination: emptyPagination };
        }

        const json: CenterWorkersResponse = await response.json();
        const pageData = json.data;
        const workers = Array.isArray(pageData?.data) ? pageData.data : [];

        return {
            workers,
            pagination: {
                current_page: pageData?.current_page ?? page,
                last_page: pageData?.last_page ?? 1,
                per_page: pageData?.per_page ?? perPage,
                total: pageData?.total ?? workers.length,
                next_page_url: pageData?.next_page_url ?? null,
                prev_page_url: pageData?.prev_page_url ?? null,
            },
        };
    } catch (error) {
        console.error("Fetch Center Workers Error:", error);
        return { workers: [], pagination: emptyPagination };
    }
};

export const fetchCenterById = async (id: string | number, token?: string): Promise<CenterDetailData | null> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
            domain: API_CENTER_DOMAIN,
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(API_ENDPOINTS.CENTER_BY_ID(id), {
            method: "GET",
            headers,
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

export const fetchUserFavorites = async (
    token: string,
    page = 1,
    perPage = 20
): Promise<{ favorites: FavoriteCenter[]; pagination: FavoritesPagination }> => {
    const emptyPagination: FavoritesPagination = {
        current_page: page,
        last_page: 1,
        per_page: perPage,
        total: 0,
    };

    try {
        const response = await fetch(API_ENDPOINTS.FAVORITES(page, perPage), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Fetch Favorites Error:", response.status, response.statusText);
            return { favorites: [], pagination: emptyPagination };
        }

        const json: FavoritesResponse = await response.json();
        const favorites = Array.isArray(json.data?.favorites) ? json.data.favorites : [];
        const pagination = json.data?.pagination;

        return {
            favorites,
            pagination: {
                current_page: pagination?.current_page ?? page,
                last_page: pagination?.last_page ?? 1,
                per_page: pagination?.per_page ?? perPage,
                total: pagination?.total ?? favorites.length,
            },
        };
    } catch (error) {
        console.error("Fetch Favorites Error:", error);
        return { favorites: [], pagination: emptyPagination };
    }
};

export const fetchCenterReviews = async (
    token: string,
    centerId: string | number,
    page = 1,
    perPage = 20
): Promise<{
    reviews: CenterReview[];
    avgRating: number | null;
    reviewsCount: number;
    pagination: CenterReviewsPagination;
}> => {
    const emptyPagination: CenterReviewsPagination = {
        current_page: page,
        last_page: 1,
        per_page: perPage,
        total: 0,
    };

    try {
        const response = await fetch(API_ENDPOINTS.CENTER_REVIEWS(centerId, page, perPage), {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Fetch Center Reviews Error:", response.status, response.statusText);
            return { reviews: [], avgRating: null, reviewsCount: 0, pagination: emptyPagination };
        }

        const json: CenterReviewsResponse = await response.json();
        const reviews = Array.isArray(json.data?.reviews) ? json.data.reviews : [];
        const avg = json.data?.avg_rating;
        const avgRating = avg === null || avg === undefined || avg === "" ? null : Number(avg);

        return {
            reviews,
            avgRating: Number.isFinite(avgRating) ? avgRating : null,
            reviewsCount: json.data?.reviews_count ?? reviews.length,
            pagination: {
                current_page: json.data?.pagination?.current_page ?? page,
                last_page: json.data?.pagination?.last_page ?? 1,
                per_page: json.data?.pagination?.per_page ?? perPage,
                total: json.data?.pagination?.total ?? reviews.length,
            },
        };
    } catch (error) {
        console.error("Fetch Center Reviews Error:", error);
        return { reviews: [], avgRating: null, reviewsCount: 0, pagination: emptyPagination };
    }
};

export const fetchMyCenterReview = async (
    token: string,
    centerId: string | number
): Promise<CenterReview | null> => {
    try {
        const response = await fetch(API_ENDPOINTS.MY_CENTER_REVIEW(centerId), {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) return null;

        const json: MyCenterReviewResponse = await response.json();
        if (!json.data?.has_review || !json.data.review) return null;
        return json.data.review;
    } catch (error) {
        console.error("Fetch My Review Error:", error);
        return null;
    }
};

async function mutateReview(
    url: string,
    method: "POST" | "PUT" | "DELETE",
    token: string,
    body?: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(url, {
            method,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: json.message || "Failed" };
        }
        return { success: true, message: json.message || "Done Successfully" };
    } catch (error) {
        console.error("Review Mutation Error:", error);
        return { success: false, message: "An unexpected error occurred" };
    }
}

export async function createCenterReview(
    token: string,
    payload: { center_id: number; rating: number; comment: string | null }
) {
    return mutateReview(API_ENDPOINTS.REVIEWS, "POST", token, payload);
}

export async function updateCenterReview(
    token: string,
    reviewId: number,
    payload: { rating: number; comment: string | null }
) {
    return mutateReview(API_ENDPOINTS.REVIEW_BY_ID(reviewId), "PUT", token, payload);
}

export async function deleteCenterReview(token: string, reviewId: number) {
    return mutateReview(API_ENDPOINTS.REVIEW_BY_ID(reviewId), "DELETE", token);
}

export const toggleCenterFavorite = async (
    token: string,
    centerId: number
): Promise<{ success: boolean; isFavorite?: boolean; message: string }> => {
    try {
        const response = await fetch(API_ENDPOINTS.FAVORITES_TOGGLE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ center_id: centerId }),
        });
        // console.log("toggleCenterFavorite payload: ", + JSON.stringify({ center_id: centerId }) );

        const json = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: json.message || "Failed to update favorite",
            };
        }

        const raw = json?.data?.is_favorite;
        const isFavorite = typeof raw === "boolean" ? raw : undefined;

        return {
            success: true,
            isFavorite,
            message: json.message || "Done Successfully",
        };
    } catch (error) {
        console.error("Toggle Favorite Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred",
        };
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

export async function buyProducts(
    token: string,
    payload: {
        center_id: number;
        branch_id: number;
        products: Array<{ id: number; qty: number }>;
        payment_type: "wallet" | "service_visa" | "sales_cash";
        sales_worker_id?: number;
        worker_id?: number | null;
        clear_cart?: boolean;
        cart_item_ids?: number[];
    }
): Promise<{ success: boolean; message: string; data?: unknown; code?: "insufficient_stock" }> {
    try {
        const body: Record<string, unknown> = {
            center_id: payload.center_id,
            branch_id: payload.branch_id,
            products: payload.products.map((line) => ({
                id: line.id,
                qty: Math.max(1, Math.floor(Number(line.qty) || 1)),
            })),
            payment_type: payload.payment_type,
            sales_worker_id: payload.sales_worker_id ?? 1,
            worker_id: payload.worker_id ?? null,
        };
        if (payload.clear_cart) body.clear_cart = true;
        if (payload.cart_item_ids?.length) body.cart_item_ids = payload.cart_item_ids;

        const response = await fetch(API_ENDPOINTS.BUY_PRODUCTS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const json = await response.json().catch(() => ({}));
        const message = String(json.message || "");
        const insufficientStock = /insufficient stock/i.test(message);

        if (!response.ok || insufficientStock) {
            return {
                success: false,
                message: message || "Product purchase failed",
                data: json.data ?? json.errors ?? json,
                code: insufficientStock ? "insufficient_stock" : undefined,
            };
        }

        return {
            success: true,
            message: message || "Products purchased successfully",
            data: json.data,
        };
    } catch (error) {
        console.error("Buy Products Error:", error);
        return {
            success: false,
            message: "An unexpected error occurred during product purchase",
        };
    }
}

export async function fetchBuyProductOrders(
    token: string,
    params?: { center_id?: number; page?: number }
): Promise<{
    success: boolean;
    message: string;
    orders: BuyProductOrder[];
    pagination: BuyProductOrdersPagination;
}> {
    const page = Math.max(1, Math.floor(Number(params?.page) || 1));
    const emptyPagination: BuyProductOrdersPagination = {
        current_page: page,
        last_page: 1,
        per_page: 15,
        total: 0,
    };

    try {
        const search = new URLSearchParams();
        search.set("page", String(page));
        if (params?.center_id != null && Number.isFinite(params.center_id) && params.center_id > 0) {
            search.set("center_id", String(params.center_id));
        }

        const response = await fetch(`${API_ENDPOINTS.BUY_PRODUCTS_ALL}?${search}`, {
            method: "GET",
            headers: authHeaders(token),
            cache: "no-store",
        });
        const json = (await response.json().catch(() => ({}))) as Partial<BuyProductOrdersResponse>;
        const orders = Array.isArray(json?.data) ? json.data! : [];
        const p = json?.paginationData;

        if (!response.ok) {
            return {
                success: false,
                message: String(json?.message || "Failed to load product orders"),
                orders: [],
                pagination: emptyPagination,
            };
        }

        return {
            success: true,
            message: String(json?.message || "Done Successfully"),
            orders,
            pagination: {
                current_page: Number(p?.current_page) || page,
                last_page: Number(p?.last_page) || 1,
                per_page: Number(p?.per_page) || 15,
                total: Number(p?.total) || orders.length,
                next_page_url: p?.next_page_url ?? null,
                prev_page_url: p?.prev_page_url ?? null,
            },
        };
    } catch (error) {
        console.error("Fetch Buy Product Orders Error:", error);
        return {
            success: false,
            message: "Failed to load product orders",
            orders: [],
            pagination: emptyPagination,
        };
    }
}

function authHeaders(token: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchCart(
    token: string,
    params?: { center_id?: number; item_type?: string }
): Promise<{ success: boolean; message: string; items: ApiCartItem[]; count: number; subtotal: number }> {
    try {
        const search = new URLSearchParams();
        if (params?.center_id != null) search.set("center_id", String(params.center_id));
        if (params?.item_type) search.set("item_type", params.item_type);
        const qs = search.toString();
        const url = qs ? `${API_ENDPOINTS.CART}?${qs}` : API_ENDPOINTS.CART;

        const response = await fetch(url, {
            method: "GET",
            headers: authHeaders(token),
            cache: "no-store",
        });
        const json = (await response.json().catch(() => ({}))) as Partial<ApiCartListResponse>;
        const items = Array.isArray(json?.data?.items) ? json.data!.items : [];
        const count = Number(json?.data?.count ?? items.length) || 0;
        const subtotal = Number(json?.data?.subtotal ?? 0) || 0;

        if (!response.ok) {
            return {
                success: false,
                message: String(json?.message || "Failed to load cart"),
                items: [],
                count: 0,
                subtotal: 0,
            };
        }

        return {
            success: true,
            message: String(json?.message || "Done Successfully"),
            items,
            count,
            subtotal,
        };
    } catch (error) {
        console.error("Fetch Cart Error:", error);
        return { success: false, message: "Failed to load cart", items: [], count: 0, subtotal: 0 };
    }
}

export async function addCartProduct(
    token: string,
    payload: { center_id: number; branch_id: number; product_id: number; qty?: number }
): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
        const response = await fetch(API_ENDPOINTS.CART_PRODUCTS, {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({
                center_id: payload.center_id,
                branch_id: payload.branch_id,
                product_id: payload.product_id,
                qty: Math.max(1, Math.floor(Number(payload.qty) || 1)),
            }),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                message: String(json?.message || "Failed to add to cart"),
                data: json?.data ?? json?.errors ?? json,
            };
        }
        return {
            success: true,
            message: String(json?.message || "Added to cart"),
            data: json?.data,
        };
    } catch (error) {
        console.error("Add Cart Product Error:", error);
        return { success: false, message: "Failed to add to cart" };
    }
}

export async function updateCartItem(
    token: string,
    cartItemId: number,
    qty: number
): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
        const response = await fetch(API_ENDPOINTS.CART_ITEM(cartItemId), {
            method: "PUT",
            headers: authHeaders(token),
            body: JSON.stringify({ qty: Math.max(1, Math.floor(qty)) }),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                message: String(json?.message || "Failed to update cart"),
                data: json?.data ?? json?.errors ?? json,
            };
        }
        return {
            success: true,
            message: String(json?.message || "Cart updated"),
            data: json?.data,
        };
    } catch (error) {
        console.error("Update Cart Item Error:", error);
        return { success: false, message: "Failed to update cart" };
    }
}

export async function removeCartItem(
    token: string,
    cartItemId: number
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(API_ENDPOINTS.CART_ITEM(cartItemId), {
            method: "DELETE",
            headers: authHeaders(token),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                message: String(json?.message || "Failed to remove cart item"),
            };
        }
        return {
            success: true,
            message: String(json?.message || "Removed from cart"),
        };
    } catch (error) {
        console.error("Remove Cart Item Error:", error);
        return { success: false, message: "Failed to remove cart item" };
    }
}

export async function clearCart(
    token: string,
    params?: { center_id?: number; branch_id?: number }
): Promise<{ success: boolean; message: string }> {
    try {
        const search = new URLSearchParams();
        if (params?.center_id != null) search.set("center_id", String(params.center_id));
        if (params?.branch_id != null) search.set("branch_id", String(params.branch_id));
        const qs = search.toString();
        const url = qs ? `${API_ENDPOINTS.CART_CLEAR}?${qs}` : API_ENDPOINTS.CART_CLEAR;

        const response = await fetch(url, {
            method: "DELETE",
            headers: authHeaders(token),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                message: String(json?.message || "Failed to clear cart"),
            };
        }
        return {
            success: true,
            message: String(json?.message || "Cart cleared"),
        };
    } catch (error) {
        console.error("Clear Cart Error:", error);
        return { success: false, message: "Failed to clear cart" };
    }
}

export async function fetchCartCheckoutPayload(
    token: string,
    params: { center_id: number; branch_id: number }
): Promise<{ success: boolean; message: string; data?: ApiCartCheckoutPayload }> {
    try {
        const search = new URLSearchParams({
            center_id: String(params.center_id),
            branch_id: String(params.branch_id),
        });
        const response = await fetch(`${API_ENDPOINTS.CART_CHECKOUT_PAYLOAD}?${search}`, {
            method: "GET",
            headers: authHeaders(token),
            cache: "no-store",
        });
        const json = (await response.json().catch(() => ({}))) as Partial<ApiCartCheckoutPayloadResponse>;
        if (!response.ok || !json?.data) {
            return {
                success: false,
                message: String(json?.message || "Failed to build checkout payload"),
            };
        }
        return {
            success: true,
            message: String(json.message || "Done Successfully"),
            data: json.data,
        };
    } catch (error) {
        console.error("Cart Checkout Payload Error:", error);
        return { success: false, message: "Failed to build checkout payload" };
    }
}

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

export async function fetchGlobalProducts(
    page = 1,
    perPage = 30
): Promise<{ products: GlobalProductListItem[]; pagination: GlobalProductsPagination }> {
    const emptyPagination: GlobalProductsPagination = {
        current_page: page,
        last_page: 1,
        per_page: perPage,
        total: 0,
    };

    try {
        const response = await fetch(API_ENDPOINTS.GLOBAL_PRODUCTS(page, perPage), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Fetch Global Products Error:", response.status, response.statusText);
            return { products: [], pagination: emptyPagination };
        }

        const json: GlobalProductsResponse = await response.json();
        const products = Array.isArray(json.data?.products) ? json.data.products : [];
        const pagination = json.data?.pagination;

        return {
            products,
            pagination: {
                current_page: pagination?.current_page ?? page,
                last_page: pagination?.last_page ?? 1,
                per_page: pagination?.per_page ?? perPage,
                total: pagination?.total ?? products.length,
            },
        };
    } catch (error) {
        console.error("Fetch Global Products Error:", error);
        return { products: [], pagination: emptyPagination };
    }
}

export async function fetchCenterProduct(
    centerId: string | number,
    productId: string | number
): Promise<CenterProductDetail | null> {
    try {
        const response = await fetch(API_ENDPOINTS.CENTER_PRODUCT(centerId, productId), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Fetch Center Product Error:", response.status, response.statusText);
            return null;
        }

        const json: CenterProductDetailResponse = await response.json();
        return json.data ?? null;
    } catch (error) {
        console.error("Fetch Center Product Error:", error);
        return null;
    }
}

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
