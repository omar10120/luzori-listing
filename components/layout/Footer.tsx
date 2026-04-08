"use client";

import React from "react";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";
import SectionHeader from "../ui/SectionHeader";

const Footer: React.FC = () => {
    const t = useTranslations();
    const currentYear = new Date().getFullYear();
    const [info, setInfo] = React.useState<import("@/lib/apiEndpoints").InfoData | null>(null);

    React.useEffect(() => {
        const { fetchInfo } = require("@/lib/api");
        fetchInfo().then((data: any) => {
            if (data) setInfo(data);
        });
    }, []);

    const FOOTER_SECTIONS = [
        {
            title: t('about_luzori'),
            links: [
                { label: t('about'), href: "/legal?tab=about_us" },
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
                { label: t('privacy_policy'), href: "/legal?tab=privacy_policy" },
                { label: t('terms_of_use'), href: "/legal?tab=terms_of_use" },
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
                { label: t('privacy_policy'), href: "/legal?tab=privacy_policy" },
                { label: t('terms_of_use'), href: "/legal?tab=terms_of_use" },
                { label: t('terms_of_service'), href: "/legal?tab=terms_of_service" },
                { label: "Cookie policy", href: "#" },
            ],
        },
    ];

    const locale = (typeof window !== 'undefined' && document.documentElement.lang === 'ar') ? 'ar' : 'en';

    return (
        <footer className="border-t border-gray-100  ">
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
                            <SectionHeader heading={t('Luzori')} />


                        </a>
                        <p className="mt-3 max-w-xs text-sm text-gray-900">
                            {info ? info.about_us[locale as 'ar' | 'en'] : t('hero_subtitle')}
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
                                            className="text-sm text-gray-900 transition-colors hover:text-gray-900"
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
                <div className="mt-12 border-t border-gray-900 pt-6">
                    <p className="text-center text-xs text-gray-900">
                        {t('copyright', { year: currentYear })}
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;