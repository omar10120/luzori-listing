export type CenterRate = "recently_viewed" | "recommended" | "new_to" | "trending";

export interface Business {
    id: string;
    name: string;
    location: string;
    category: string;
    rating: number;
    reviewCount: number;
    image: string;
    isNew?: boolean;
    isTrending?: boolean;
}

export interface Review {
    id: string;
    title: string;
    content: string;
    rating: number;
    author: {
        name: string;
        location: string;
        avatar: string;
    };
}

export interface Stat {
    id: string;
    value: string;
    numericValue: number;
    suffix: string;
    label: string;
}

export interface CityGroup {
    country: string;
    cities: string[];
}

export interface NavLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: NavLink[];
}
