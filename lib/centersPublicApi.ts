'use server'
import {
  API_CENTER_DOMAIN,
  API_ENDPOINTS,
  CenterResponse,
  CenterListResponse,
  GlobalCategory,
  CenterDetailData,
} from "./apiEndpoints";

function isGlobalCategory(item: unknown): item is GlobalCategory {
  return (
    item != null &&
    typeof item === "object" &&
    "id" in item &&
    "name" in item &&
    "slug" in item &&
    typeof (item as GlobalCategory).name === "string" &&
    typeof (item as GlobalCategory).slug === "string"
  );
}

/** Supports `{ data: [...] }` or nested `{ data: { data: [...] } }`. */
function extractGlobalCategories(json: unknown): GlobalCategory[] {
  if (!json || typeof json !== "object") return [];
  const root = json as Record<string, unknown>;
  const first = root.data;
  if (Array.isArray(first)) return first.filter(isGlobalCategory);
  if (first && typeof first === "object" && "data" in first && Array.isArray((first as { data: unknown }).data)) {
    return (first as { data: unknown[] }).data.filter(isGlobalCategory);
  }
  return [];
}

export async function fetchGlobalCategoriesClient(): Promise<GlobalCategory[]> {
  try {
    const res = await fetch(API_ENDPOINTS.GLOBAL_CATEGORIES, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        domain: API_CENTER_DOMAIN,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.warn("[global-categories] HTTP", res.status, errBody.slice(0, 200));
      return [];
    }
    const json: unknown = await res.json();
    const list = extractGlobalCategories(json);
    if (list.length) return list;
    const fallback = json as { data?: unknown };
    if (Array.isArray(fallback.data)) return fallback.data.filter(isGlobalCategory);
    return [];
  } catch (e) {
    console.error("[global-categories]", e);
    return [];
  }
}

export type CentersSearchParams = {
  search?: string;
  global_category_id?: string;
  global_category_slug?: string;
  rate?: string;
  page?: number;
  per_page?: number;
};

// ✅ New interface to return both centers and pagination data
export interface CentersSearchResponse {
  centers: CenterDetailData[];
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

export async function fetchCentersSearchClient(
  params: CentersSearchParams,
  options: { includeWorkers?: boolean } = {}
): Promise<CentersSearchResponse> {
  try {
    const qs = new URLSearchParams();
    
    // Add 'workers' to the include list if requested
    const includeList = [
      "global_categories",
      "branches",
      "categories",
      "services",
      "packages",
      "about_us",
      "vacations"
    ];
    if (options.includeWorkers) {
      includeList.push("workers");
    }
    qs.set("include", includeList.join(","));

    if (params.search?.trim()) qs.set("search", params.search.trim());
    if (params.global_category_id) qs.set("global_category_id", params.global_category_id);
    if (params.global_category_slug) qs.set("global_category_slug", params.global_category_slug);
    if (params.rate) qs.set("rate", params.rate);
    
    // ✅ Append pagination params
    if (params.page) qs.set("page", params.page.toString());
    if (params.per_page) qs.set("per_page", params.per_page.toString());

    const url = qs.toString() ? `${API_ENDPOINTS.CENTERS}?${qs}` : API_ENDPOINTS.CENTERS;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        domain: API_CENTER_DOMAIN,
      },
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.error("[centers-search] HTTP", res.status, res.statusText);
      throw new Error(`Failed to fetch centers: ${res.status}`);
    }

    const json: CenterResponse | CenterListResponse = await res.json();
    
    // ✅ Safely parse pagination based on Laravel's default structure
    const isPaginated = !Array.isArray(json.data) && json.data && "current_page" in json.data;
    
    let centers: CenterDetailData[] = [];
    let total = 0;
    let lastPage = 1;
    let currentPage = 1;
    let perPage = 20;

    if (isPaginated) {
      const paginatedData = json.data as any;
      centers = Array.isArray(paginatedData.data) ? paginatedData.data : [];
      total = paginatedData.total ?? 0;
      lastPage = paginatedData.last_page ?? 1;
      currentPage = paginatedData.current_page ?? 1;
      perPage = paginatedData.per_page ?? 20;
    } else {
      // Fallback for non-paginated responses (like single center details)
      centers = Array.isArray(json.data) ? json.data : (json.data as any).data || [];
      total = centers.length;
    }
    
    if (!Array.isArray(centers)) {
      console.error("[centers-search] Unexpected response shape", json);
      return { centers: [], total: 0, lastPage: 1, currentPage: 1, perPage: 20 };
    }

    return {
      centers,
      total,
      lastPage,
      currentPage,
      perPage
    };

  } catch (error) {
    console.error("[centers-search]", error);
    throw error; // Throw so the frontend can catch it and show an error state
  }
}