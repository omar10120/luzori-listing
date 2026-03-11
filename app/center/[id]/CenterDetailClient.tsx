"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Star,
    MapPin,
    Clock,
    Phone,
    Globe,
    Share2,
    Heart,
    ChevronRight,
    Scissors,
    Sparkles,
    Calendar,
    CheckCircle,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
import type { CenterDetailData } from "@/lib/apiEndpoints";
import Link from "next/link";

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

const MOCK_PORTFOLIO = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526045478516-99145907023c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1521590832167-7228f3efb43d?w=400&h=400&fit=crop",
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ─── Hero Section ─────────────────────────────────────── */}
            <section className="relative h-[50vh] min-h-[360px] w-full overflow-hidden bg-gray-900">
                <img
                    src={(center.primary_images && center.primary_images.length > 0) ? center.primary_images[0] : fallbackImage}
                    alt={center.name}
                    className="h-full w-full object-cover opacity-80"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Top nav */}
                <div className="absolute top-0 inset-x-0 z-10">
                    <Container className="flex items-center justify-between py-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFav(!isFav)}
                                className="flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md p-2.5 text-white hover:bg-white/30 transition-colors"
                            >
                                <Heart size={18} className={cn(isFav && "fill-red-500 text-red-500")} />
                            </button>
                            <button className="flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md p-2.5 text-white hover:bg-white/30 transition-colors">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </Container>
                </div>

                {/* Hero text */}
                <div className="absolute bottom-0 inset-x-0 z-10">
                    <Container className="pb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                {center.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-white">4.8</span>
                                    <span>(128)</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    <span>{center.domain}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span className="text-green-400 font-medium">Open Now</span>
                                </div>
                            </div>
                        </motion.div>
                    </Container>
                </div>
            </section>

            {/* ─── Content ─────────────────────────────────────────── */}
            <Container className="py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* ──── Services ──────────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-5">Services</h2>

                            {/* Tabs */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
                                {SERVICE_TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveServiceTab(tab)}
                                        className={cn(
                                            "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all",
                                            activeServiceTab === tab
                                                ? "bg-gray-900 text-white shadow-md"
                                                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Service list */}
                            <div className="divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden shadow-sm">
                                {filteredServices.map((svc) => (
                                    <div
                                        key={svc.id}
                                        className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-colors">
                                                {svc.category === "Hair" && <Scissors size={16} />}
                                                {svc.category === "Skin" && <Sparkles size={16} />}
                                                {svc.category === "Body" && <Users size={16} />}
                                                {svc.category === "Nails" && <Sparkles size={16} />}
                                                {svc.category === "Special" && <Star size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                                                <p className="text-xs text-gray-400">{svc.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-900">{svc.price}</span>
                                            <button className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors">
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* ──── Team ───────────────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-5">Team</h2>
                            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
                                {MOCK_TEAM.map((member) => (
                                    <div key={member.id} className="flex flex-col items-center shrink-0 group cursor-pointer">
                                        <div className="relative mb-2">
                                            <img
                                                src={member.avatar}
                                                alt={member.name}
                                                className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-gray-900 transition-all"
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                                        <span className="text-xs text-gray-400">{member.role}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* ──── Reviews ────────────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-lg font-bold text-gray-900">4.8</span>
                                    <span className="text-sm text-gray-400">(128 reviews)</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {MOCK_REVIEWS.map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="rounded-2xl bg-white p-5 ring-1 ring-gray-100 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                                                    {rev.author.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{rev.author}</p>
                                                    <p className="text-xs text-gray-400">{rev.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={cn(
                                                            i < rev.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-200"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{rev.text}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* ──── Portfolio ──────────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-5">Portfolio</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {center.primary_images && center.primary_images.length > 0 ? (
                                    center.primary_images.map((img, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square overflow-hidden rounded-xl group cursor-pointer"
                                        >
                                            <img
                                                src={img}
                                                alt={`Portfolio ${i + 1}`}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    MOCK_PORTFOLIO.map((img, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square overflow-hidden rounded-xl group cursor-pointer"
                                        >
                                            <img
                                                src={img}
                                                alt={`Portfolio ${i + 1}`}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.section>

                        {/* ──── About ──────────────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                            <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Welcome to <strong>{center.name}</strong> — your premier destination for self-care and beauty services.
                                    We offer a wide range of professional treatments including hair styling, skincare, body treatments,
                                    nail care, and exclusive bridal packages. Our team of certified professionals is dedicated to
                                    providing you with an exceptional experience in a luxurious and relaxing environment.
                                </p>
                                <div className="mt-5 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        <span>Licensed & Certified</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        <span>Premium Products</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        <span>Hygienic Environment</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        <span>Satisfaction Guaranteed</span>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* ──── Opening Hours ─────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Opening Hours</h2>
                            <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                {OPENING_HOURS.map((item) => {
                                    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                                    const isToday = item.day === today;
                                    return (
                                        <div
                                            key={item.day}
                                            className={cn(
                                                "flex items-center justify-between px-5 py-3 text-sm",
                                                isToday && "bg-gray-50"
                                            )}
                                        >
                                            <span className={cn("text-gray-600", isToday && "font-semibold text-gray-900")}>
                                                {item.day}
                                                {isToday && (
                                                    <span className="ml-2 text-xs rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">
                                                        Today
                                                    </span>
                                                )}
                                            </span>
                                            <span className={cn("text-gray-500", isToday && "font-medium text-gray-900")}>
                                                {item.hours}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    </div>

                    {/* ─── Sidebar ────────────────────────────────── */}
                    <aside className="space-y-6">
                        {/* Sticky booking card */}
                        <div className="lg:sticky lg:top-20">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-md"
                            >
                                {/* Logo + Name */}
                                <div className="flex items-center gap-4 mb-5">
                                    <img
                                        src={center.logo || fallbackImage}
                                        alt={`${center.name} logo`}
                                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-100"
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">{center.name}</h3>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-semibold text-gray-900">4.8</span>
                                            <span className="text-xs text-gray-400">(128)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <button className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 mb-4">
                                    Book Now
                                </button>

                                {/* Info */}
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                        <span className="text-gray-600">{center.domain}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                        <span className="text-gray-600">+971 50 XXX XXXX</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <Globe size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                        <span className="text-gray-600">{center.domain}.luzori.com</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-green-600 font-medium">Open</span>
                                            <span className="text-gray-400"> · Closes 9:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Map placeholder */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6 rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm"
                            >
                                <div className="relative h-48 w-full bg-gray-200">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462560.6828896398!2d54.94755!3d25.0762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai!5e0!3m2!1sen!2sae!4v1"
                                        className="absolute inset-0 w-full h-full border-0"
                                        loading="lazy"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="bg-white p-3">
                                    <p className="text-sm font-medium text-gray-900">View on map</p>
                                    <p className="text-xs text-gray-400">Get directions</p>
                                </div>
                            </motion.div>
                        </div>
                    </aside>
                </div>
            </Container>
        </div>
    );
}
