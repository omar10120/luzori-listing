import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CenterDetailData } from '@/lib/apiEndpoints';

interface SidebarProps {
    center: CenterDetailData;
    fallbackImage: string;
    onBookNow: () => void;
    isFav: boolean;
    onToggleFav: () => void;
    favLoading?: boolean;
}

export default function Sidebar({ center, fallbackImage, onBookNow, isFav, onToggleFav, favLoading }: SidebarProps) {
    const t = useTranslations();

    return (
        <aside className="space-y-6">
            <div className="sticky top-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xl"
                >
                    {/* Logo + Name */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                            <img
                                src={center.logo || fallbackImage}
                                alt={`${center.name} logo`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{center.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-900">
                                    {center.avg_rating}
                                </span>
                                <span className="text-sm text-gray-500">({center.rate})</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <Button onClick={onBookNow} className="w-full py-4 text-base font-black uppercase tracking-wider shadow-lg shadow-gray-900/10">
                        {t('book_now')}
                    </Button>

                    <button
                        type="button"
                        onClick={onToggleFav}
                        disabled={favLoading}
                        aria-pressed={isFav}
                        className={cn(
                            "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-bold transition-colors disabled:opacity-60",
                            isFav
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                        )}
                    >
                        <Star size={18} className={isFav ? "fill-amber-400 text-amber-400" : "text-gray-500"} />
                        {isFav ? t("remove_from_favorites") : t("add_to_favorites")}
                    </button>

                    {/* Info */}
                    <div className="mt-8 space-y-4 pt-6 border-t border-gray-50">
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">{t('address')}</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {center.branches?.[0]
                                        ? `${center.branches[0].address}, ${center.branches[0].city}`
                                        : center.domain}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock size={18} className="text-gray-400 mt-1 shrink-0" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900">{t('opening_hours')}</p>
                                    <span className="text-[10px] items-center uppercase font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">{t('open_now')}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{t('until')} {center.branches[0].open_time == null ? "9:00 AM" : center.branches[0].open_time}  </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mini Map */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
                    <div className="h-48 w-full bg-gray-100 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=25.0762,54.94755&zoom=14&size=600x300&key=AIzaSy...')] bg-cover">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                    <button className="flex items-center justify-between w-full bg-white px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                        {t('get_directions')} <ChevronRight size={16} className="rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
