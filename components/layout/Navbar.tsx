"use client";

import React, { useState, useEffect } from "react";
import {
    Menu, X, User, Calendar, Wallet, Heart, ClipboardList,
    ShoppingBag, Settings, LogOut, Download, HelpCircle,
    Globe, Building2, ChevronRight
} from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { fetchUserProfile } from "@/lib/api";

const Navbar: React.FC = () => {
    const t = useTranslations();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });

        const token = localStorage.getItem("authToken");
        if (token) {
            fetchUserProfile(token).then(data => {
                if (data) setUser(data);
            });
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
        window.location.reload();
    };
    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-gradient-to-r from-[#F5DBBA] to-[#D7A783] shadow-sm backdrop-blur-lg"
                    : "bg-gradient-to-r from-[#F5DBBA] to-[#D7A783]"
            )}
        >
            <Container className="flex h-16 items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-gray-900"
                    aria-label="Luzori home"
                >
                    <Image src="/logo.svg" alt="Luzori" width={70} height={70} />
                </Link>

                {/* Desktop right side */}
                <div className="hidden items-center gap-6 sm:flex">
                    <LocaleSwitcher />
                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('login')}</Link>
                            {/* <span className="text-gray-300">/</span>
                            <Link href="/register" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('register')}</Link> */}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        </div>
                    )}
                    <Button variant="primary" size="sm">
                        <Link href="https://dashboard.luzori.com" target="_blank">{t('list_your_business')}</Link>
                    </Button>
                    <div className="relative">
                        {user && (
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                aria-label="User profile"
                            >
                                {user?.image ? (
                                    <Image src={user.image} alt={user.name} width={36} height={36} className="h-full w-full object-cover" />
                                ) : (
                                    (user?.name?.charAt(0) || "U")
                                )}
                            </button>
                        )}
                        {user && isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 transition-all z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                    </div>

                                    <div className="space-y-0.5">
                                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                            <User size={18} className="text-gray-500" />
                                            <span>{t('profile') || "Profile"}</span>
                                        </Link>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Calendar size={18} className="text-gray-500" />
                                            <span>{t('activity') || "Activity"}</span>
                                        </button>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Wallet size={18} className="text-gray-500" />
                                            <span>{t('wallet') || "Wallet"}</span>
                                        </button>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Heart size={18} className="text-gray-500" />
                                            <span>{t('favorites') || "Favorites"}</span>
                                        </button>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <ClipboardList size={18} className="text-gray-500" />
                                            <span>{t('forms') || "Forms"}</span>
                                        </button>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <ShoppingBag size={18} className="text-gray-500" />
                                            <span>{t('product_orders') || "Product orders"}</span>
                                        </button>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Settings size={18} className="text-gray-500" />
                                            <span>{t('settings') || "Settings"}</span>
                                        </button>

                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <LogOut size={18} className="text-gray-500" />
                                                <span>{t('logout') || "Log out"}</span>
                                            </button>
                                        </div>

                                        <div className="h-px bg-gray-100 my-1 mx-2" />

                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Download size={18} className="text-gray-500" />
                                            <span>{t('download_app') || "Download the app"}</span>
                                        </button>
                                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <HelpCircle size={18} className="text-gray-500" />
                                            <span>{t('help_support') || "Help and support"}</span>
                                        </button>
                                        <div className="px-3 py-2">
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <Globe size={18} className="text-gray-500" />
                                                <LocaleSwitcher />
                                            </div>
                                        </div>

                                        {/* <div className="h-px bg-gray-100 my-1 mx-2" /> */}

                                        {/* <Link href="https://dashboard.luzori.com" target="_blank" className="flex items-center justify-between gap-3 px-3 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Building2 size={18} className="text-gray-500" />
                                                <span>{t('for_businesses') || "For businesses"}</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </Link> */}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile menu toggle */}
                <div className="flex items-center gap-2 sm:hidden">
                    <LocaleSwitcher />
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </Container>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden transition-all duration-300">
                    {!user ? (
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/login"
                                className="flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t('login')}
                            </Link>
                            {/* <Link
                                href="/register"
                                className="flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t('register')}
                            </Link> */}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-50">
                                <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white overflow-hidden">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.name} width={40} height={40} className="object-cover" />
                                    ) : user.name?.charAt(0) || "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex h-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100"
                            >
                                {t('logout') || "Logout"}
                            </button>
                        </div>
                    )}
                    <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                            <Link
                                href="https://dashboard.luzori.com"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                target="_blank"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t('list_your_business')}
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;