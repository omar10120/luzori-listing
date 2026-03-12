import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import type { CenterDetailData } from '@/lib/apiEndpoints';

interface SidebarProps {
    center: CenterDetailData;
    fallbackImage: string;
}

export default function Sidebar({ center, fallbackImage }: SidebarProps) {
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
                                <span className="text-sm font-bold text-gray-900">4.8</span>
                                <span className="text-sm text-gray-500">(128)</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <Button className="w-full py-4 text-base font-black uppercase tracking-wider shadow-lg shadow-gray-900/10">
                        {t('book_now')}
                    </Button>

                    {/* Info */}
                    <div className="mt-8 space-y-4 pt-6 border-t border-gray-50">
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">{t('address')}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{center.domain}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock size={18} className="text-gray-400 mt-1 shrink-0" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900">{t('opening_hours')}</p>
                                    <span className="text-[10px] items-center uppercase font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">{t('open_now')}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{t('until')} 9:00 PM</p>
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
