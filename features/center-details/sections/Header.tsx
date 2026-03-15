import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from "@/components/ui/Button";
import { Search, Menu } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Header() {
    const t = useTranslations();
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
            <Container className="flex h-16 items-center justify-between py-2">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1">
                    <Image src="/logo.svg" alt="Luzori" width={100} height={100} />
                </Link>

                {/* Compact Search Box */}
                <div className="hidden max-w-xl flex-1 items-center gap-0 rounded-full border border-gray-200 bg-white p-1 md:flex mx-8 shadow-sm">
                    <div className="flex flex-1 items-center gap-2 px-3">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{t('all_treatments')}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex flex-1 items-center gap-2 px-3">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{t('current_location')}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex flex-1 items-center gap-2 px-3">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{t('any_time')}</span>
                    </div>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800">
                        <Search size={14} />
                    </button>
                </div>

                {/* Menu Button */}
                <div className="flex items-center gap-2 ">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full px-4 font-semibold ">
                        {t('menu')} <Menu size={16} />
                    </Button>
                </div>
            </Container>
        </header>
    );
}
