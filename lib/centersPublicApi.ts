'use server'
import {
  API_ENDPOINTS,
  CenterResponse,
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
  global_category_id?: string;
  global_category_slug?: string;
  rate?: string;
};

export async function fetchCentersSearchClient(params: CentersSearchParams): Promise<CenterDetailData[]> {
  try {
    const qs = new URLSearchParams();
    if (params.global_category_id) qs.set("global_category_id", params.global_category_id);
    if (params.global_category_slug) qs.set("global_category_slug", params.global_category_slug);
    if (params.rate) qs.set("rate", params.rate);

    const url = qs.toString() ? `${API_ENDPOINTS.CENTERS}?${qs}` : API_ENDPOINTS.CENTERS;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json: CenterResponse = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}
