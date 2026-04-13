"use client";

import React from "react";
import { Rocket, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ComingSoonProps {
    title?: string;
    subtitle?: string;
}

export default function ComingSoon({ title, subtitle }: ComingSoonProps) {
    const t = useTranslations();

    return (
        <div className="w-full flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-white to-purple-50/30 rounded-[2.5rem] border border-purple-100/50 shadow-xl shadow-purple-500/5 overflow-hidden relative group">
            {/* Animated Background Blob */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 delay-100" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-8 animate-bounce transition-transform hover:scale-110">
                    <Rocket className="text-white w-12 h-12" />
                </div>
                
                <h2 className="text-3xl md:text-2xl font-black text-gray-900 mb-4 tracking-tight">
                    {title || "Coming Soon"}
                </h2>
                
                <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed font-medium">
                    {subtitle || "We’re working hard to bring this feature to life. Stay tuned for something amazing!"}
                </p>
                
                <Link 
                    href="/profile"
                    className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-gray-900/20 active:scale-95 group/btn"
                >
                    <ArrowLeft size={18} className="transition-transform group-hover/btn:-translate-x-1" />
                    <span>Back to Profile</span>
                </Link>
            </div>
        </div>
    );
}
