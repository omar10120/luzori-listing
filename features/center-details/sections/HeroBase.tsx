"use client";

import React, { useState } from 'react';
import { ChevronRight, Star, MapPin, Share2, Heart, Check } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { CenterDetailData } from '@/lib/apiEndpoints';

interface HeroBaseProps {
    center: CenterDetailData;
    isFav: boolean;
    onToggleFav: () => void;
}

export default function HeroBase({ center, isFav, onToggleFav }: HeroBaseProps) {
    const t = useTranslations();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Use the current URL
        const shareUrl = window.location.href;
        const shareTitle = center.name;
        const shareText = `Check out ${center.name} on Luzori!`;

        try {
            // 1. Try Native Web Share API (Mobile)
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                // 2. Fallback: Copy to Clipboard (Desktop)
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // If the user cancels the share sheet, it throws an error. 
            // We only want to alert if it's a real failure, not a cancellation.
            if ((error as Error).name !== 'AbortError') {
                alert('Could not share. Please try copying the URL from the address bar.');
            }
        }
    };

    return (
        <div className="mb-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                <Link href="/" className="hover:text-gray-900">{t('home')}</Link>
                <ChevronRight size={12} className="rtl:rotate-180" />
                <Link href="#" className="hover:text-gray-900">{t('beauty_salons')}</Link>
                <ChevronRight size={12} className="rtl:rotate-180" />
                <Link href="#" className="hover:text-gray-900">{t('limassol')}</Link>
                <ChevronRight size={12} className="rtl:rotate-180" />
                <span className="text-gray-900 font-medium">{center.name}</span>
            </div>

            {/* Title Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-2xl font-bold text-gray-900 mb-3">{center.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900">
                                {center.avg_rating}
                            </span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-blue-600 hover:underline cursor-pointer">(1,496)</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-green-600">{t('open_now')}</span>
                            <span>– {t('until')} {center.branches[0].open_time == null ? "9:00 AM" : center.branches[0].open_time}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span>
                                {center.branches?.[0]
                                    ? `${center.branches[0].address}, ${center.branches[0].city}`
                                    : center.domain}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Share Button */}
                    <button 
                        onClick={handleShare}
                        aria-label={t('share')}
                        className={cn(
                            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-colors",
                            copied 
                                ? "border-green-500 bg-green-50" 
                                : "border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {copied ? (
                            <Check size={18} className="text-green-600" />
                        ) : (
                            <Share2 size={18} className="text-gray-700" />
                        )}
                    </button>

                    {/* Favorite Button */}
                    <button
                        onClick={onToggleFav}
                        aria-label={isFav ? t('remove_from_favorites') : t('add_to_favorites')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Heart size={18} className={cn("text-gray-700", isFav && "fill-red-500 text-red-500 border-red-500")} />
                    </button>
                </div>
            </div>
        </div>
    );
}