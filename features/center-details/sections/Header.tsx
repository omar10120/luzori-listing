import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from "@/components/ui/Button";
import {
    Search, Menu, User, Calendar, Wallet, Heart, ClipboardList,
    ShoppingBag, Settings, LogOut, Download, HelpCircle,
    Globe, Building2, ChevronRight
} from "lucide-react";
import { useTranslations } from 'next-intl';
import { fetchUserProfile } from '@/lib/api';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';

export default function Header() {
    const t = useTranslations();
    const [user, setUser] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            fetchUserProfile(token).then(data => {
                if (data) setUser(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
        window.location.reload();
    };

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

                {/* User Profile / Menu */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden flex-col items-end sm:flex text-right">
                                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                                
                            </div>
                            <div className="relative">
                            
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d4af37] overflow-hidden transition-transform hover:scale-105 active:scale-95 focus:outline-none"
                                >
                                    
                                    <Image
                                        src={user.image_url || "/assets/img/avatars/1.png"}
                                        alt={user.name}
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                </button>
                                {/* Dropdown placeholder or Logout bit */}
                                {isProfileOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 transition-all z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-gray-50 mb-1 text-left">
                                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                            </div>

                                            <div className="space-y-0.5">
                                                <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <User size={18} className="text-gray-500" />
                                                    <span>{t('profile') || "Profile"}</span>
                                                </Link>
                                                <Link href="/activity" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <Calendar size={18} className="text-gray-500" />
                                                    <span>{t('activity') || "Activity"}</span>
                                                </Link>
                                                <Link href="/wallet" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <Wallet size={18} className="text-gray-500" />
                                                    <span>{t('wallet') || "Wallet"}</span>
                                                </Link>
                                                <Link href="/favorites" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <Heart size={18} className="text-gray-500" />
                                                    <span>{t('favorites') || "Favorites"}</span>
                                                </Link>
                                                <Link href="/forms" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <ClipboardList size={18} className="text-gray-500" />
                                                    <span>{t('forms') || "Forms"}</span>
                                                </Link>
                                                <Link href="/product-orders" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <ShoppingBag size={18} className="text-gray-500" />
                                                    <span>{t('product_orders') || "Product orders"}</span>
                                                </Link>
                                                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    <Settings size={18} className="text-gray-500" />
                                                    <span>{t('settings') || "Settings"}</span>
                                                </Link>

                                                <div className="py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                                    >
                                                        <LogOut size={18} className="text-gray-500" />
                                                        <span>{t('logout') || "Log out"}</span>
                                                    </button>
                                                </div>

                                                <div className="h-px bg-gray-100 my-1 mx-2" />

                                                <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                                                    <Download size={18} className="text-gray-500" />
                                                    <span>{t('download_app') || "Download the app"}</span>
                                                </button>
                                                <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                                                    <HelpCircle size={18} className="text-gray-500" />
                                                    <span>{t('help_support') || "Help and support"}</span>
                                                </button>
                                                <div className="px-3 py-2 text-left">
                                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                                        <Globe size={18} className="text-gray-500" />
                                                        <LocaleSwitcher />
                                                    </div>
                                                </div>

                                                <div className="h-px bg-gray-100 my-1 mx-2" />

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
                    ) : (
                        <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full px-4 font-semibold">
                            {t('menu')} <Menu size={16} />
                        </Button>
                    )}
                </div>

            </Container>
        </header>
    );
}
