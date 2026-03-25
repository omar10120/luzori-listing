"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User, Calendar, Wallet, Heart,
    ClipboardList, ShoppingBag, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Activity", href: "/activity", icon: Calendar },
    { label: "Wallet", href: "/wallet", icon: Wallet },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Forms", href: "/forms", icon: ClipboardList },
    { label: "Product orders", href: "/product-orders", icon: ShoppingBag },
    { label: "Settings", href: "/settings", icon: Settings },
];

interface AccountSidebarProps {
    userName?: string;
}

export default function AccountSidebar({ userName }: AccountSidebarProps) {
    const pathname = usePathname();

    // Strip locale prefix, e.g. /en/profile → /profile
    const cleanPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    return (
        <aside className="w-full lg:w-56 shrink-0 block max-md:hidden">
            {userName && (
                <p className="mb-4 text-sm font-bold text-gray-900 px-2">{userName}</p>
            )}

            <nav className="flex flex-col gap-0.5">
                {menuItems.map(({ label, href, icon: Icon }) => {
                    const isActive = cleanPath === href || cleanPath.startsWith(href + "/");

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                isActive
                                    ? "bg-purple-50 text-purple-700"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <Icon
                                size={18}
                                className={cn(
                                    isActive ? "text-purple-600" : "text-gray-400"
                                )}
                            />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
