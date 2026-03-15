"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslations } from "next-intl";
import Image from "next/image";

const Navbar: React.FC = () => {
    const t = useTranslations();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <Image src="logo.svg" alt="Luzori" width={100} height={100} />
                </Link>

                {/* Desktop right side */}
                <div className="hidden items-center gap-6 sm:flex ">
                    <LocaleSwitcher />
                    <div className="flex items-center gap-2">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('login')}</Link>
                        <span className="text-gray-300">/</span>
                        <Link href="/register" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('register')}</Link>
                    </div>
                    <Button variant="primary" size="sm" >
                        <Link href="https://dashboard.luzori.com" target="_blank" >{t('list_your_business')}</Link>
                    </Button>
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
                        aria-label="User profile"
                    >
                        U
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
                <>
                    <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/login"
                                className="flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white"
                            >
                                {t('login')}
                            </Link>
                            <Link
                                href="/register"
                                className="flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white"
                            >
                                {t('register')}
                            </Link>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
                        <Button variant="outline" size="sm" className="w-full">
                            <Link
                                href="https://dashboard.luzori.com"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                target="_blank"
                            >
                                {t('list_your_business')}
                            </Link>
                        </Button>
                    </div>

                </>

            )}
        </header>
    );
};

export default Navbar;