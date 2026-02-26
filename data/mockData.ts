import type { Business, Review, Stat, CityGroup } from "@/lib/types";

export const recommendedBusinesses: Business[] = [
    {
        id: "r1",
        name: "Glow Studio",
        location: "Downtown, Dubai",
        category: "Hair Salon",
        rating: 4.9,
        reviewCount: 432,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
    },
    {
        id: "r2",
        name: "Serenity Spa",
        location: "Marina Walk, Dubai",
        category: "Spa & Massage",
        rating: 4.8,
        reviewCount: 312,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&h=400&fit=crop",
    },
    {
        id: "r3",
        name: "Urban Barber",
        location: "JBR, Dubai",
        category: "Barbershop",
        rating: 4.7,
        reviewCount: 289,
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop",
    },
    {
        id: "r4",
        name: "Nail Artistry",
        location: "Jumeirah, Dubai",
        category: "Nail Salon",
        rating: 4.9,
        reviewCount: 198,
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop",
    },
    {
        id: "r5",
        name: "Zen Wellness",
        location: "Business Bay, Dubai",
        category: "Wellness Center",
        rating: 4.6,
        reviewCount: 156,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    },
];

export const newBusinesses: Business[] = [
    {
        id: "n1",
        name: "Bella Skin Clinic",
        location: "Al Barsha, Dubai",
        category: "Skin Care",
        rating: 5.0,
        reviewCount: 12,
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop",
        isNew: true,
    },
    {
        id: "n2",
        name: "Urban Parlour & Beauty",
        location: "DIFC, Dubai",
        category: "Hair & Beauty",
        rating: 4.8,
        reviewCount: 8,
        image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop",
        isNew: true,
    },
    {
        id: "n3",
        name: "The Royal Barber",
        location: "Palm Jumeirah, Dubai",
        category: "Barbershop",
        rating: 4.9,
        reviewCount: 5,
        image: "https://images.unsplash.com/photo-1585747860019-8901f42f5e9f?w=600&h=400&fit=crop",
        isNew: true,
    },
    {
        id: "n4",
        name: "Lotus Spa Retreat",
        location: "Deira, Dubai",
        category: "Spa",
        rating: 5.0,
        reviewCount: 3,
        image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop",
        isNew: true,
    },
    {
        id: "n5",
        name: "Brow Bar Studio",
        location: "Silicon Oasis, Dubai",
        category: "Eyebrow Threading",
        rating: 4.7,
        reviewCount: 15,
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop",
        isNew: true,
    },
];

export const trendingBusinesses: Business[] = [
    {
        id: "t1",
        name: "Glamour Lounge",
        location: "City Walk, Dubai",
        category: "Beauty Lounge",
        rating: 4.9,
        reviewCount: 876,
        image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&h=400&fit=crop",
        isTrending: true,
    },
    {
        id: "t2",
        name: "Imagine Spa",
        location: "Dubai Mall, Dubai",
        category: "Spa",
        rating: 4.8,
        reviewCount: 654,
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop",
        isTrending: true,
    },
    {
        id: "t3",
        name: "Sharp Edge Barbers",
        location: "Downtown, Dubai",
        category: "Barbershop",
        rating: 4.7,
        reviewCount: 543,
        image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=400&fit=crop",
        isTrending: true,
    },
    {
        id: "t4",
        name: "Noor Aesthetics",
        location: "Al Quoz, Dubai",
        category: "Aesthetics",
        rating: 4.9,
        reviewCount: 421,
        image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop",
        isTrending: true,
    },
    {
        id: "t5",
        name: "Velvet Hair Studio",
        location: "Marina, Dubai",
        category: "Hair Salon",
        rating: 4.8,
        reviewCount: 389,
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop",
        isTrending: true,
    },
];

export const reviews: Review[] = [
    {
        id: "rev1",
        title: "Amazing experience!",
        content:
            "The atmosphere was so relaxing, and the staff were incredibly professional. My skin has never looked better after the facial treatment.",
        rating: 5,
        author: {
            name: "Sarah M.",
            location: "Dubai, UAE",
            avatar: "SM",
        },
    },
    {
        id: "rev2",
        title: "Best barber in town",
        content:
            "I've been going to different barbers for years, but this one tops them all. Attention to detail and great conversation.",
        rating: 5,
        author: {
            name: "Ahmed K.",
            location: "Abu Dhabi, UAE",
            avatar: "AK",
        },
    },
    {
        id: "rev3",
        title: "So easy to book!",
        content:
            "Finding and booking a spa appointment used to be a hassle. With this platform it took 30 seconds. Love it!",
        rating: 5,
        author: {
            name: "Lisa W.",
            location: "Sharjah, UAE",
            avatar: "LW",
        },
    },
    {
        id: "rev4",
        title: "My go-to platform",
        content:
            "From nail salons to massages, I book everything here. The reviews are genuinely helpful and the whole process is seamless.",
        rating: 5,
        author: {
            name: "Fatima R.",
            location: "Dubai, UAE",
            avatar: "FR",
        },
    },
];

export const stats: Stat[] = [
    {
        id: "s1",
        value: "1 billion+",
        numericValue: 1,
        suffix: " billion+",
        label: "appointments booked on Luzori",
    },
    {
        id: "s2",
        value: "130,000+",
        numericValue: 130000,
        suffix: "+",
        label: "partner businesses",
    },
    {
        id: "s3",
        value: "120+",
        numericValue: 120,
        suffix: "+",
        label: "countries",
    },
    {
        id: "s4",
        value: "450,000+",
        numericValue: 450000,
        suffix: "+",
        label: "stylists and professionals",
    },
];

export const cityGroups: CityGroup[] = [
    {
        country: "UAE",
        cities: [
            "Dubai",
            "Abu Dhabi",
            "Sharjah",
            "Ajman",
            "Ras Al Khaimah",
            "Fujairah",
            "Al Ain",
            "Umm Al Quwain",
        ],
    },
    {
        country: "Saudi Arabia",
        cities: [
            "Riyadh",
            "Jeddah",
            "Dammam",
            "Mecca",
            "Medina",
            "Khobar",
            "Tabuk",
            "Abha",
        ],
    },
    {
        country: "Egypt",
        cities: [
            "Cairo",
            "Alexandria",
            "Giza",
            "Sharm El Sheikh",
            "Hurghada",
            "Luxor",
            "Aswan",
            "Mansoura",
        ],
    },
    {
        country: "Jordan",
        cities: [
            "Amman",
            "Irbid",
            "Zarqa",
            "Aqaba",
            "Madaba",
            "Salt",
        ],
    },
    {
        country: "Kuwait",
        cities: [
            "Kuwait City",
            "Hawalli",
            "Salmiya",
            "Farwaniya",
            "Jahra",
            "Ahmadi",
        ],
    },
    {
        country: "Bahrain",
        cities: [
            "Manama",
            "Muharraq",
            "Riffa",
            "Hamad Town",
            "Isa Town",
        ],
    },
];
