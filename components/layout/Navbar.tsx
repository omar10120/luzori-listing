"use client";

import React, { useState, useEffect } from "react";
import {
    Menu, X, User, Calendar, Wallet, Heart, ClipboardList,
    ShoppingBag, Settings, LogOut, Download, HelpCircle,
    Globe
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
    const [user, setUser] = useState<any>(null); //eslint-disable-line
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
          
            {/* Mobile dropdown */}
            <div
                className={cn(
                    "absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] sm:hidden overflow-y-auto border-t border-[#225D5C]/10 bg-gradient-to-b from-[#FFFDFC] to-[#F6F8F8] transition-all duration-300 ease-out",
                    mobileOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-3 opacity-0"
                )}
            >
                <div className="min-h-full px-4 pb-6 pt-4">
                    {!user ? (
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/login"
                                className="flex h-11 items-center justify-center rounded-xl border border-[#225D5C]/20 bg-white text-sm font-semibold text-[#225D5C] shadow-sm transition-all duration-200 hover:bg-[#225D5C]/5"
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
                            <div className="flex items-center gap-3 rounded-2xl border border-[#225D5C]/10 bg-white/90 px-3 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#163D3C] text-white ring-2 ring-[#D8B48A]/30">
                                    {user.image ? (
                                            <Image src={user.image_url || "/assets/img/avatars/1.png"} alt={user.name} width={40} height={40} className="object-cover" unoptimized />
                                    ) : user.name?.charAt(0) || "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-1 rounded-2xl border border-[#225D5C]/10 bg-white/85 p-2 shadow-sm" aria-label="Account">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <User size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("profile")}
                                </Link>
                                <Link
                                    href="/activity"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Calendar size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("activity")}
                                </Link>
                                <Link
                                    href="/wallet"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Wallet size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("wallet")}
                                </Link>
                                <Link
                                    href="/favorites"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Heart size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("favorites")}
                                </Link>
                                <Link
                                    href="/forms"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <ClipboardList size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("forms")}
                                </Link>
                                <Link
                                    href="/product_orders"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <ShoppingBag size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("product_orders")}
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-[#225D5C]/8"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Settings size={18} className="shrink-0 text-[#225D5C]" />
                                    {t("settings")}
                                </Link>
                            </nav>

                            <button
                                type="button"
                                onClick={() => {
                                    handleLogout();
                                    setMobileOpen(false);
                                }}
                                className="flex h-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-100"
                            >
                                {t("logout")}
                            </button>
                        </div>
                    )}
                    <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full border-[#225D5C]/20 bg-white/90 text-[#225D5C] hover:bg-[#225D5C]/5">
                            <Link
                                href="https://dashboard.luzori.com"
                                className="text-sm font-semibold text-[#225D5C] transition-colors hover:text-[#163D3C]"
                                target="_blank"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t('list_your_business')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;