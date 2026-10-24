"use client"; // Added to support useState for the fallback

import React, { useState } from 'react';
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
    const [googleMapFailed, setGoogleMapFailed] = useState(false);

    // 1. Find the FIRST branch that has BOTH latitude and longitude
    const validBranch = center.branches?.find(
        (b) => b.latitude && b.latitude !== '' && b.longitude && b.longitude !== ''
    );

    const lat = validBranch?.latitude || '';
    const lng = validBranch?.longitude || '';
    const hasCoordinates = lat !== '' && lng !== '';

    const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Determine which map to show
    const useGoogleMap = hasCoordinates && mapApiKey && !googleMapFailed;
    const useOsmIframe = hasCoordinates && (!mapApiKey || googleMapFailed);

    // Google Static Map URL (If key exists)
    const googleMapUrl = useGoogleMap
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x400&markers=color:red%7C${lat},${lng}&key=${mapApiKey}`
        : null;

    // OpenStreetMap Interactive Iframe URL (No API Key Needed)
    const osmIframeUrl = useOsmIframe
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.005},${Number(lat) - 0.005},${Number(lng) + 0.005},${Number(lat) + 0.005}&layer=mapnik&marker=${lat},${lng}`
        : null;

    // Google Maps Directions URL
    const directionsUrl = hasCoordinates 
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(validBranch?.address || center.name)}`;

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
                                    {validBranch 
                                        ? `${validBranch.address}, ${validBranch.city}`
                                        : center.branches?.[0] 
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
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {t('until')} {center.branches?.[0]?.open_time == null ? "9:00 AM" : center.branches[0].open_time}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Extended Map Section */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group">
                    <div className="h-64 w-full bg-gray-100 relative">
                        {/* 1. Google Static Map (If Key Exists) */}
                        {googleMapUrl && (
                            <a 
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full cursor-pointer relative z-10"
                                title="Open in Google Maps"
                            >
                                <img 
                                    src={googleMapUrl} 
                                    alt="Location Map" 
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    onError={() => setGoogleMapFailed(true)} // Fallback if key fails
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                            </a>
                        )}

                        {/* 2. OpenStreetMap Interactive Iframe (Fallback) */}
                        {osmIframeUrl && (
                            <iframe
                                src={osmIframeUrl}
                                className="w-full h-full border-0 relative z-10"
                                title="Location Map"
                                loading="lazy"
                            />
                        )}

                        {/* 3. Missing Coordinates Fallback */}
                        {!hasCoordinates && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center">
                                <MapPin size={32} className="mb-2 opacity-50" />
                                <span className="text-sm font-medium">Map view unavailable</span>
                                <span className="text-xs mt-1">Coordinates missing</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Directions Button */}
                    <a 
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full bg-white px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors z-20"
                    >
                        {t('get_directions')} <ChevronRight size={16} className="rtl:rotate-180" />
                    </a>
                </div>
            </div>
        </aside>
    );
}