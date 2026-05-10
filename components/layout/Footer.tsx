"use client";

import React from "react";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";
import SectionHeader from "../ui/SectionHeader";
import { fetchInfo } from "@/lib/api";
import Link from "next/link";
import type { InfoData } from "@/lib/apiEndpoints";

const Footer: React.FC = () => {
    const t = useTranslations();
    const currentYear = new Date().getFullYear();
    const [info, setInfo] = React.useState<InfoData | null>(null);

    React.useEffect(() => {
        fetchInfo().then((data: InfoData | null) => {
            if (data) setInfo(data);
        });
    }, []);

    const FOOTER_SECTIONS = [
        {
            title: t('about_luzori'),
            links: [
                { label: t('about'), href: "/legal?tab=about_us" },
                { label: t('careers'), href: "#" },
                { label: t('partners'), href: "#" },
                { label: t('press'), href: "#" },
            ],
        },
        {
            title: t('support'),
            links: [
                { label: t('help_center'), href: "#" },
                { label: t('contact_us'), href: "#" },
                { label: t('privacy_policy'), href: "/legal?tab=privacy_policy" },
                { label: t('terms_of_use'), href: "/legal?tab=terms_of_use" },
            ],
        },
        {
            title: t('solutions'),
            links: [
                { label: t('luzori_for_business'), href: "#" },
                { label: t('pricing'), href: "#" },
                { label: t('features'), href: "#" },
                { label: t('integrations'), href: "#" },
            ],
        },
        {
            title: t('legal'),
            links: [
                { label: t('privacy_policy'), href: "/legal?tab=privacy_policy" },
                { label: t('terms_of_use'), href: "/legal?tab=terms_of_use" },
                { label: t('terms_of_service'), href: "/legal?tab=terms_of_service" },
                { label: t('cookie_policy'), href: "#" },
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
                        <Link
                            href="/"
                            className="text-xl font-bold tracking-tight text-gray-900"
                            aria-label="Luzori home"
                        >
                            <SectionHeader heading={t('Luzori')} />
                        </Link>
                        <div 
                            className="mt-3 max-w-xs text-[9px] text-gray-900"
                            dangerouslySetInnerHTML={{ 
                                __html: info ? info.about_us[locale as 'ar' | 'en'] : t('hero_subtitle') 
                            }}
                        />
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