"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Star,
    MapPin,
    Share2,
    Heart,
    ChevronRight,
    Scissors,
    Sparkles,
    CheckCircle,
    Users,
    Search,
    Clock,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import type { CenterDetailData } from "@/lib/apiEndpoints";
import Link from "next/link";
import {
    SEARCH_PLACEHOLDER_TREATMENT,
    SEARCH_PLACEHOLDER_LOCATION,
    SEARCH_PLACEHOLDER_TIME,
} from "@/lib/constants";

/* ─── Mock Data for sections not in API ─────────────────────────── */

const MOCK_SERVICES = [
    { id: 1, name: "Classic Haircut", price: "120 AED", duration: "45 min", category: "Hair" },
    { id: 2, name: "Hair Color & Highlights", price: "350 AED", duration: "120 min", category: "Hair" },
    { id: 3, name: "Deep Cleansing Facial", price: "200 AED", duration: "60 min", category: "Skin" },
    { id: 4, name: "Full Body Massage", price: "280 AED", duration: "90 min", category: "Body" },
    { id: 5, name: "Manicure & Pedicure", price: "150 AED", duration: "60 min", category: "Nails" },
    { id: 6, name: "Bridal Package", price: "1500 AED", duration: "240 min", category: "Special" },
];

const MOCK_TEAM = [
    { id: 1, name: "Sarah", role: "Senior Stylist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
    { id: 2, name: "Nadia", role: "Colorist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: 3, name: "Layla", role: "Nail Tech", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
    { id: 4, name: "Amira", role: "Therapist", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
];

const MOCK_REVIEWS = [
    { id: 1, author: "Fatima K.", rating: 5, text: "Amazing experience! The staff was so professional and the results exceeded my expectations.", date: "2 days ago" },
    { id: 2, author: "Mariam S.", rating: 4, text: "Loved the atmosphere and quality of service. Will definitely come back for more treatments.", date: "1 week ago" },
    { id: 3, author: "Noura A.", rating: 5, text: "Best salon in town! The attention to detail is incredible. Highly recommend the bridal package.", date: "2 weeks ago" },
];

const SERVICE_TABS = ["All", "Hair", "Skin", "Body", "Nails", "Special"];

const OPENING_HOURS = [
    { day: "Monday", hours: "9:00 AM – 9:00 PM" },
    { day: "Tuesday", hours: "9:00 AM – 9:00 PM" },
    { day: "Wednesday", hours: "9:00 AM – 9:00 PM" },
    { day: "Thursday", hours: "9:00 AM – 9:00 PM" },
    { day: "Friday", hours: "2:00 PM – 10:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 10:00 PM" },
    { day: "Sunday", hours: "10:00 AM – 8:00 PM" },
];

/* ─── Main Component ─────────────────────────────────────────────── */

interface Props {
    center: CenterDetailData;
}

export default function CenterDetailClient({ center }: Props) {
    const [activeServiceTab, setActiveServiceTab] = useState("All");
    const [isFav, setIsFav] = useState(false);

    const filteredServices =
        activeServiceTab === "All"
            ? MOCK_SERVICES
            : MOCK_SERVICES.filter((s) => s.category === activeServiceTab);

    const fallbackImage =
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop";

    const displayImages = center.primary_images && center.primary_images.length > 0
        ? center.primary_images
        : [fallbackImage];

    return (
        <div className="min-h-screen bg-white">
            {/* ─── Sticky Header ────────────────────────────────────── */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
                <Container className="flex h-16 items-center justify-between py-2">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1">
                        <span className="text-2xl font-black tracking-tighter text-gray-900">luzori</span>
                    </Link>

                    {/* Compact Search Box */}
                    <div className="hidden max-w-xl flex-1 items-center gap-0 rounded-full border border-gray-200 bg-white p-1 md:flex mx-8 shadow-sm">
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">All Treatments</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Current location</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Any time</span>
                        </div>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800">
                            <Search size={14} />
                        </button>
                    </div>

                    {/* Menu Button */}
                    <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-gray-200 px-4 font-semibold text-gray-700">
                        Menu <Menu size={16} />
                    </Button>
                </Container>
            </header>

            {/* ─── Page Content ────────────────────────────────────── */}
            <main>
                <Container className="py-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                        <Link href="/" className="hover:text-gray-900">Home</Link>
                        <ChevronRight size={12} />
                        <Link href="#" className="hover:text-gray-900">test1</Link>
                        <ChevronRight size={12} />
                        <Link href="#" className="hover:text-gray-900">test2</Link>
                        <ChevronRight size={12} />
                        <span className="text-gray-900 font-medium">{center.name}</span>
                    </div>

                    {/* Title Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{center.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">5.0</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-blue-600 hover:underline cursor-pointer">(1,496)</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-orange-600">Closed</span>
                                    <span>– opens at 10:00 AM</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>{center.domain}, {center.id % 2 === 0 ? "Limassol" : "Dubai"}</span>
                                    {/* <button className="text-blue-600 hover:underline font-medium ml-1">Get directions</button> */}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                                <Share2 size={18} className="text-gray-700" />
                            </button>
                            <button
                                onClick={() => setIsFav(!isFav)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <Heart size={18} className={cn("text-gray-700", isFav && "fill-red-500 text-red-500 border-red-500")} />
                            </button>
                        </div>
                    </div>

                    {/* Image Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-8">
                        {/* Primary Large Image */}
                        <div className="md:col-span-2 aspect-[4/3] md:aspect-auto md:h-[500px] overflow-hidden rounded-xl bg-gray-100">
                            <img
                                src={displayImages[0]}
                                alt={center.name}
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                        </div>

                        {/* Secondary Smaller Images */}
                        <div className="flex flex-col gap-2 md:gap-4 md:h-[500px]">
                            <div className="flex-1 overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={displayImages[1] || fallbackImage}
                                    alt={center.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                            <div className="relative flex-1 overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={displayImages[2] || fallbackImage}
                                    alt={center.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                {displayImages.length > 3 && (
                                    <button className="absolute bottom-4 right-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50">
                                        See all images
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* ──── Services ──────────────────────────── */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>

                                {/* Tabs */}
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6 border-b border-gray-100">
                                    {SERVICE_TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveServiceTab(tab)}
                                            className={cn(
                                                "whitespace-nowrap px-4 py-2 text-sm font-semibold transition-all relative",
                                                activeServiceTab === tab
                                                    ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900"
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Service list */}
                                <div className="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                                    {filteredServices.map((svc) => (
                                        <div
                                            key={svc.id}
                                            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 group-hover:bg-gray-100 transition-colors">
                                                    {svc.category === "Hair" && <Scissors size={18} />}
                                                    {svc.category === "Skin" && <Sparkles size={18} />}
                                                    {svc.category === "Body" && <Users size={18} />}
                                                    {svc.category === "Nails" && <Sparkles size={18} />}
                                                    {svc.category === "Special" && <Star size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-gray-900">{svc.name}</p>
                                                    <p className="text-sm text-gray-500">{svc.duration}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-base font-bold text-gray-900">{svc.price}</span>
                                                <Button size="sm" className="rounded-lg px-6">Book</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ──── About ──────────────────────────────── */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <p className="leading-relaxed">
                                        Welcome to <strong>{center.name}</strong> — your premier destination for self-care and beauty services.
                                        We offer a wide range of professional treatments including hair styling, skincare, body treatments,
                                        nail care, and exclusive bridal packages. Our team of certified professionals is dedicated to
                                        providing you with an exceptional experience in a luxurious and relaxing environment.
                                    </p>
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            "Licensed & Certified",
                                            "Premium Products",
                                            "Hygienic Environment",
                                            "Satisfaction Guaranteed",
                                        ].map((perk) => (
                                            <div key={perk} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <CheckCircle size={18} className="text-green-500 shrink-0" />
                                                <span className="font-medium">{perk}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* ──── Team ───────────────────────────────── */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Team</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {MOCK_TEAM.map((member) => (
                                        <div key={member.id} className="flex flex-col items-center group cursor-pointer">
                                            <div className="relative mb-3">
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-gray-900 transition-all duration-300"
                                                />
                                            </div>
                                            <span className="text-base font-bold text-gray-900">{member.name}</span>
                                            <span className="text-sm text-gray-500">{member.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ──── Reviews ────────────────────────────── */}
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                        <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-xl font-black text-gray-900">4.8</span>
                                        <span className="text-sm text-gray-500 font-medium">(128 reviews)</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {MOCK_REVIEWS.map((rev) => (
                                        <div
                                            key={rev.id}
                                            className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white shadow-lg">
                                                        {rev.author.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-bold text-gray-900">{rev.author}</p>
                                                        <p className="text-xs text-gray-400">{rev.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={cn(
                                                                i < rev.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-100"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed font-medium italic">"{rev.text}"</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* ─── Sidebar ────────────────────────────────── */}
                        <aside className="space-y-6">
                            <div className="sticky top-24">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xl"
                                >
                                    {/* Logo + Name */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                                            <img
                                                src={center.logo || fallbackImage}
                                                alt={`${center.name} logo`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{center.name}</h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-bold text-gray-900">4.8</span>
                                                <span className="text-sm text-gray-500">(128)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Button className="w-full py-4 text-base font-black uppercase tracking-wider shadow-lg shadow-gray-900/10">
                                        Book Now
                                    </Button>

                                    {/* Info */}
                                    <div className="mt-8 space-y-4 pt-6 border-t border-gray-50">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Address</p>
                                                <p className="text-sm text-gray-500 mt-0.5">{center.domain}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Clock size={18} className="text-gray-400 mt-1 shrink-0" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900">Opening Hours</p>
                                                    <span className="text-[10px] items-center uppercase font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">Open Now</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-0.5">Until 9:00 PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Mini Map */}
                                <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
                                    <div className="h-48 w-full bg-gray-100 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=25.0762,54.94755&zoom=14&size=600x300&key=AIzaSy...')] bg-cover">
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <button className="flex items-center justify-between w-full bg-white px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                                        Get directions <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </Container>
            </main>
        </div>
    );
}
