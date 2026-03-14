import React from 'react';
import { ChevronRight, Star, MapPin, Share2, Heart } from 'lucide-react';
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{center.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900">
                                {center.rate === 'recommended' ? '5.0' : '4.8'}
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
                            <span className="font-semibold text-orange-600">{t('closed')}</span>
                            <span>– {t('opens_at')} 10:00 AM</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span>
                                {center.branches?.[0] 
                                    ? `${center.branches[0].address}, ${center.branches[0].city}` 
                                    : center.domain}
                            </span>
                            <button className="text-blue-600 hover:underline font-medium ml-1 rtl:mr-1 rtl:ml-0">{t('get_directions')}</button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Share2 size={18} className="text-gray-700" />
                    </button>
                    <button
                        onClick={onToggleFav}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Heart size={18} className={cn("text-gray-700", isFav && "fill-red-500 text-red-500 border-red-500")} />
                    </button>
                </div>
            </div>
        </div>
    );
}
