"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { SITE_NAME, NAV_CTA_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const Navbar: React.FC = () => {
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
                    ? "bg-white/80 shadow-sm backdrop-blur-lg"
                    : "bg-transparent"
            )}
        >
            <Container className="flex h-16 items-center justify-between">
                {/* Logo */}
                <a
                    href="/"
                    className="text-xl font-bold tracking-tight text-gray-900"
                    aria-label={`${SITE_NAME} home`}
                >
                    {SITE_NAME}
                </a>

                {/* Desktop right side */}
                <div className="hidden items-center gap-6 sm:flex">
                    <a
                        href="/register"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Login / Register
                    </a>
                    <Button variant="outline" size="sm">
                        {NAV_CTA_TEXT}
                    </Button>
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
                        aria-label="User profile"
                    >
                        U
                    </div>
                </div>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 sm:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </Container>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
                    <Button variant="outline" size="sm" className="w-full">
                        {NAV_CTA_TEXT}
                    </Button>
                </div>
            )}
        </header>
    );
};

export default Navbar;
