import type {
  Branch,
  CenterDetailData,
  Service,
} from "./apiEndpoints";
import type { SearchMapMarker } from "@/components/search/SearchMap";

const VENUE_KEY_PREFIX = "v";
const PROFESSIONAL_KEY_PREFIX = "p";

export function venueKey(centerId: number): string {
  return `${VENUE_KEY_PREFIX}-${centerId}`;
}

export function professionalKey(centerId: number, workerId: number): string {
  return `${PROFESSIONAL_KEY_PREFIX}-${centerId}-${workerId}`;
}

function toFiniteCoord(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return null;
  return n;
}

function branchCoords(branch: Branch | undefined | null):
  | { lat: number; lng: number }
  | null {
  if (!branch) return null;
  const lat = toFiniteCoord(branch.latitude);
  const lng = toFiniteCoord(branch.longitude);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

/** Build map markers for the Venues tab — one per branch. */
export function buildVenueMarkers(centers: CenterDetailData[]): SearchMapMarker[] {
  const out: SearchMapMarker[] = [];
  for (const c of centers) {
    for (const b of c.branches || []) {
      const coords = branchCoords(b);
      if (!coords) continue;
      out.push({
        id: venueKey(c.id),
        lat: coords.lat,
        lng: coords.lng,
        rating: 4.8,
        title: c.name,
        subtitle: b.name,
        city: b.city,
        address: b.address,
      });
    }
  }
  return out;
}

export interface ProfessionalService {
  id: number;
  name: string;
  price: number | string;
  maxTime?: string | null;
  categoryName?: string;
}

export interface Professional {
  key: string;
  workerId: number;
  centerId: number;
  centerName: string;

  centerLogo?: string | null;
  centerSlug?: string | null;
  centerCategoryName?: string | null;
  centerGlobalCategoryName?: string | null;

  name: string;
  image: string;
  email?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  branch: Branch | null;
  branchName?: string | null;
  hasCommission: boolean;
  services: ProfessionalService[];
}

interface MutableProfessional extends Professional {
  _seenServiceIds: Set<number>;
}

/** Backend may return 0/1, true/false, or string flags — normalize. */
function isProfessionalWorker(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
  return false;
}

/** Flatten workers across categories+services into unique professionals per center.
 *  Only workers with `is_professional` truthy are returned.
 */
export function buildProfessionals(centers: CenterDetailData[]): Professional[] {
  const map = new Map<string, MutableProfessional>();

  const pushService = (
    pro: MutableProfessional,
    s: Service,
    categoryName?: string
  ): void => {
    if (pro._seenServiceIds.has(s.id)) return;
    pro._seenServiceIds.add(s.id);
    pro.services.push({
      id: s.id,
      name: s.name,
      price: s.price,
      maxTime: s.max_time ?? null,
      categoryName,
    });
  };

  for (const c of centers) {
    const branchById = new Map<number, Branch>();
    for (const b of c.branches || []) branchById.set(b.id, b);

    for (const cat of c.categories || []) {
      for (const s of cat.services || []) {
        for (const w of s.workers || []) {
          if (!isProfessionalWorker(w.is_professional)) continue;

          const key = professionalKey(c.id, w.id);
          let pro = map.get(key);
          if (!pro) {
            pro = {
              key,
              workerId: w.id,
              centerId: c.id,
              centerName: c.name,
              centerLogo: c.logo,
              centerSlug: null,
              centerCategoryName: cat.name,
              centerGlobalCategoryName: c.global_categories?.[0]?.name ?? null,
              name: w.name,
              image: w.image,
              email: w.email ?? null,
              phone: w.phone ?? null,
              countryCode: w.country_code ?? null,
              branch: branchById.get(w.branch_id) ?? null,
              branchName: w.branch_name ?? branchById.get(w.branch_id)?.name ?? null,
              hasCommission: Boolean(w.has_commission),
              services: [],
              _seenServiceIds: new Set<number>(),
            };
            map.set(key, pro);
          }
          pushService(pro, s, cat.name);
        }
      }
    }
  }

  return Array.from(map.values()).map((p) => {
    const { _seenServiceIds: _, ...rest } = p;
    void _;
    return rest;
  });
}

/** Build map markers for the Professionals tab — one per worker at their branch. */
export function buildProfessionalMarkers(
  professionals: Professional[]
): SearchMapMarker[] {
  const out: SearchMapMarker[] = [];
  for (const pro of professionals) {
    const coords = branchCoords(pro.branch);
    if (!coords) continue;
    out.push({
      id: pro.key,
      lat: coords.lat,
      lng: coords.lng,
      rating: 4.9,
      title: pro.name,
      subtitle: pro.centerName,
      city: pro.branch?.city,
      address: pro.branch?.address,
    });
  }
  return out;
}

export interface ProfessionalCenterEntry {
  centerId: number;
  centerName: string;
  centerLogo?: string | null;
  centerCategoryName?: string | null;
  branch: Branch | null;
  branchName?: string | null;
  services: ProfessionalService[];
}

export interface ProfessionalProfile {
  /** Identity used to group across centers (email or fallback). */
  identityKey: string;
  /** Whether the worker was uniquely identified by email. */
  matchedByEmail: boolean;
  name: string;
  image: string;
  email?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  role?: string | null;
  centers: ProfessionalCenterEntry[];
}

function uniqueServices(services: ProfessionalService[]): ProfessionalService[] {
  const seen = new Set<number>();
  const out: ProfessionalService[] = [];
  for (const s of services) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
  }
  return out;
}

/**
 * Resolve a worker (identified by the slug source: centerId + workerId) to a
 * unified profile that aggregates the same person across multiple centers.
 *
 * Matching strategy (in priority order):
 * 1. Email — when present, matches all workers across centers sharing that email.
 * 2. Fallback to the source worker only when no email exists.
 */
export function findProfessionalProfile(
  centers: CenterDetailData[],
  sourceCenterId: number,
  sourceWorkerId: number
): ProfessionalProfile | null {
  const all = buildProfessionals(centers);
  const source = all.find(
    (p) => p.centerId === sourceCenterId && p.workerId === sourceWorkerId
  );
  if (!source) return null;

  const normalizedEmail = source.email?.trim().toLowerCase() || null;
  const matches = normalizedEmail
    ? all.filter((p) => p.email?.trim().toLowerCase() === normalizedEmail)
    : [source];

  const role =
    matches.find((m) => m.centerCategoryName)?.centerCategoryName ??
    matches.find((m) => m.centerGlobalCategoryName)?.centerGlobalCategoryName ??
    null;

  return {
    identityKey: normalizedEmail ?? source.key,
    matchedByEmail: Boolean(normalizedEmail),
    name: source.name,
    image: source.image,
    email: source.email ?? null,
    phone: source.phone ?? null,
    countryCode: source.countryCode ?? null,
    role,
    centers: matches.map((m) => ({
      centerId: m.centerId,
      centerName: m.centerName,
      centerLogo: m.centerLogo ?? null,
      centerCategoryName: m.centerCategoryName ?? null,
      branch: m.branch,
      branchName: m.branchName ?? m.branch?.name ?? null,
      services: uniqueServices(m.services),
    })),
  };
}

/** Flatten all services from all centers a professional works at. */
export function flattenProfessionalServices(
  profile: ProfessionalProfile
): Array<ProfessionalService & { centerId: number; centerName: string }> {
  const out: Array<ProfessionalService & { centerId: number; centerName: string }> = [];
  const seen = new Set<string>();
  for (const c of profile.centers) {
    for (const s of c.services) {
      const key = `${c.centerId}-${s.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...s, centerId: c.centerId, centerName: c.centerName });
    }
  }
  return out;
}
