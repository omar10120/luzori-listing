/**
 * Converts a string into a URL-friendly slug.
 * Handles both Latin and non-Latin characters (like Arabic).
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\u0621-\u064A-]+/g, '') // Remove all non-word chars (allow Arabic)
        .replace(/--+/g, '-')           // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generates a center-specific slug in the format: [slugified-name]-[id]
 */
export function generateCenterSlug(name: string, id: string | number): string {
    const slugName = slugify(name);
    return `${slugName}-${id}`;
}

/**
 * Extracts the ID from a center slug (format: [name-parts]-[id]).
 */
export function extractIdFromSlug(slug: string): string {
    const parts = slug.split('-');
    return parts.pop() || '';
}

/**
 * Generates a professional/worker slug that encodes both the source center id
 * and the source worker id, e.g. `john-smith-c1-w3`. The full identity (across
 * centers) is later resolved by matching email at the data layer.
 */
export function generateProfessionalSlug(
    name: string,
    centerId: number | string,
    workerId: number | string
): string {
    const base = slugify(name) || 'pro';
    return `${base}-c${centerId}-w${workerId}`;
}

/** Reverse of {@link generateProfessionalSlug}. Returns null on malformed slugs. */
export function extractProfessionalIdsFromSlug(
    slug: string
): { centerId: number; workerId: number } | null {
    const match = /-c(\d+)-w(\d+)$/.exec(slug);
    if (!match) return null;
    return { centerId: Number(match[1]), workerId: Number(match[2]) };
}
