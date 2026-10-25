"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
}

interface TeamProps {
    team: TeamMember[];
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
}

export default function Team({ team, hasMore, loading, onLoadMore }: TeamProps) {
    const t = useTranslations();
    
    // State to track how many members to show. Starts at 6.
    const [visibleCount, setVisibleCount] = useState(6);

    // Safely slice the array
    const safeTeam = Array.isArray(team) ? team : [];
    const visibleTeam = safeTeam.slice(0, visibleCount);
    
    // Determine if we should show the "Load More" button
    const canLoadMore = safeTeam.length > visibleCount || hasMore;

    const handleLoadMore = () => {
        if (safeTeam.length > visibleCount) {
            // If we have more items in the current array, show 6 more
            setVisibleCount((prev) => prev + 6);
        } else if (hasMore && onLoadMore) {
            // If we ran out of items but the API has more, fetch the next page
            onLoadMore();
            setVisibleCount((prev) => prev + 6);
        }
    };

    const handleShowLess = () => {
        setVisibleCount(6);
    };

    return (
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('team')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {visibleTeam.map((member) => (
                    <div key={member.id} className="flex flex-col items-center group cursor-pointer">
                        <div className="relative mb-3">
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-[#225D5C] transition-all duration-300"
                            />
                        </div>
                        <span className="text-base font-bold text-gray-900 text-center line-clamp-1 w-full px-2">{member.name}</span>
                        <span className="text-sm text-gray-500 text-center line-clamp-1 w-full px-2">{member.role}</span>
                    </div>
                ))}
            </div>
            
            {/* Controls */}
            <div className="mt-8 flex items-center gap-6">
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
                        {t("loading") || "Loading..."}
                    </div>
                ) : canLoadMore ? (
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        className="text-sm font-bold text-[#225D5C] hover:underline transition-colors"
                    >
                        {t("see_more")}
                    </button>
                ) : null}

                {visibleCount > 6 && !loading && (
                    <button
                        type="button"
                        onClick={handleShowLess}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                    >
                        {t("show_less") || "Show less"}
                    </button>
                )}
            </div>
        </section>
    );
}