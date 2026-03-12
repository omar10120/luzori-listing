import React from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Review {
    id: number;
    author: string;
    rating: number;
    text: string;
    date: string;
}

interface ReviewsProps {
    reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
    const t = useTranslations();

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('reviews')}</h2>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-black text-gray-900">4.8</span>
                    <span className="text-sm text-gray-500 font-medium">(128 {t('reviews')})</span>
                </div>
            </div>
            <div className="space-y-6">
                {reviews.map((rev) => (
                    <div
                        key={rev.id}
                        className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white shadow-lg">
                                    {rev.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900">{rev.author}</p>
                                    <p className="text-xs text-gray-400">{rev.date}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={cn(
                                            i < rev.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-100"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium italic">"{rev.text}"</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
