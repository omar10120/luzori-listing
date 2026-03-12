"use client";

import React from "react";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";

const Footer: React.FC = () => {
    const t = useTranslations();
    const currentYear = new Date().getFullYear();

    const FOOTER_SECTIONS = [
        {
            title: t('about_luzori'),
            links: [
                { label: t('about'), href: "#" },
                { label: "Careers", href: "#" },
                { label: "Partners", href: "#" },
                { label: "Press", href: "#" },
            ],
        },
        {
            title: t('support'),
            links: [
                { label: "Help center", href: "#" },
                { label: "Contact us", href: "#" },
                { label: "Privacy policy", href: "#" },
                { label: "Terms of use", href: "#" },
            ],
        },
        {
            title: t('solutions'),
            links: [
                { label: t('luzori_for_business'), href: "#" },
                { label: "Pricing", href: "#" },
                { label: "Features", href: "#" },
                { label: "Integrations", href: "#" },
            ],
        },
        {
            title: t('legal'),
            links: [
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Cookie policy", href: "#" },
                { label: "Accessibility", href: "#" },
            ],
        },
    ];

    return (
        <footer className="border-t border-gray-100 bg-white">
            <Container className="py-12 sm:py-16">
                {/* Top grid */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
                    {/* Brand column */}
                    <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                        <a
                            href="/"
                            className="text-xl font-bold tracking-tight text-gray-900"
                            aria-label="Luzori home"
                        >
                            Luzori
                        </a>
                        <p className="mt-3 max-w-xs text-sm text-gray-500">
                            {t('hero_subtitle')}
                        </p>
                    </div>

                    {/* Link columns */}
                    {FOOTER_SECTIONS.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-gray-900">
                                {section.title}
                            </h3>
                            <ul className="mt-3 space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-gray-100 pt-6">
                    <p className="text-center text-xs text-gray-400">
                        {t('copyright', { year: currentYear })}
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;