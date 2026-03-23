import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from "@/components/ui/Button";
import { Search, Menu } from "lucide-react";
import { useTranslations } from 'next-intl';
import { fetchUserProfile } from '@/lib/api';

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
                                        src={user.image || "/assets/img/avatars/1.png"} 
                                        alt={user.name} 
                                        width={40} 
                                        height={40} 
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                                {/* Dropdown placeholder or Logout bit */}
                                {isProfileOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setIsProfileOpen(false)} 
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-32 rounded-lg bg-white p-2 shadow-xl ring-1 ring-black/5 transition-all z-50">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                {t('logout') || "Logout"}
                                            </button>
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
