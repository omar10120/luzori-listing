import type { FooterSection } from "./types";

/* ─── Site Info ─── */
export const SITE_NAME = "Luzori";
export const SITE_DESCRIPTION =
    "Book local selfcare services — beauty, massage, wellness, and more, wherever you are.";

/* ─── Navbar ─── */
export const NAV_CTA_TEXT = "List your business";

/* ─── Hero ─── */
export const HERO_HEADING = "Book local selfcare services";
export const HERO_SUBTITLE =
    "Discover top-rated beauty, salon, massage, wellness, and barber services near you — book in seconds.";
export const HERO_STATS_TEXT = "141,863 appointments booked today";
export const HERO_APP_CTA = "Get the app";
export const SEARCH_PLACEHOLDER_TREATMENT = "Treatment or venue";
export const SEARCH_PLACEHOLDER_LOCATION = "Current location";
export const SEARCH_PLACEHOLDER_TIME = "Any time";
export const SEARCH_BUTTON_TEXT = "Search";

/* ─── Section Headings ─── */
export const RECOMMENDED_HEADING = "Recommended";
export const NEW_HEADING = "New to Luzori";
export const TRENDING_HEADING = "Trending";

/* ─── App Download ─── */
export const APP_DOWNLOAD_HEADING = "Download the Luzori app";
export const APP_DOWNLOAD_SUBTITLE =
    "Book appointments on the go. Get real-time updates, exclusive deals, and manage all your bookings.";

/* ─── Reviews ─── */
export const REVIEWS_HEADING = "Reviews";

/* ─── Stats ─── */
export const STATS_HEADING = "The top-rated destination for selfcare";
export const STATS_SUBTITLE =
    "One platform for everything selfcare. Thousands of venues. Millions of happy customers.";

/* ─── Business ─── */
export const BUSINESS_HEADING = "Luzori for business";
export const BUSINESS_SUBTITLE =
    "It gives you the tools you need to accelerate growth, all in one beautifully designed platform for you to manage and grow your business.";
export const BUSINESS_CTA = "Discover more";
export const BUSINESS_RATING_TEXT = "Excellent 4.8 ★";

/* ─── Browse City ─── */
export const BROWSE_CITY_HEADING = "Browse by City";

/* ─── Footer ─── */
export const FOOTER_SECTIONS: FooterSection[] = [
    {
        title: "About Luzori",
        links: [
            { label: "About us", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Partners", href: "#" },
            { label: "Press", href: "#" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Help center", href: "#" },
            { label: "Contact us", href: "#" },
            { label: "Privacy policy", href: "#" },
            { label: "Terms of use", href: "#" },
        ],
    },
    {
        title: "Solutions",
        links: [
            { label: "Luzori for business", href: "#" },
            { label: "Pricing", href: "#" },
            { label: "Features", href: "#" },
            { label: "Integrations", href: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Cookie policy", href: "#" },
            { label: "Accessibility", href: "#" },
        ],
    },
];

export const FOOTER_COPYRIGHT = `© ${new Date().getFullYear()} Luzori. All rights reserved.`;
