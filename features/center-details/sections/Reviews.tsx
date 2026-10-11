"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { CenterReview } from "@/lib/apiEndpoints";

interface ReviewsProps {
    reviews: CenterReview[];
    avgRating: number | null;
    reviewsCount: number;
    myReview: CenterReview | null;
    isAuthenticated: boolean;
    loading?: boolean;
    ready?: boolean;
    submitting?: boolean;
    page: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    onRequireLogin: () => void;
    onSubmit: (payload: { rating: number; comment: string | null }) => void;
    onDelete: () => void;
}

function formatReviewDate(value: string) {
    const parsed = new Date(value.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function ratingLabel(value: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function Reviews({
    reviews,
    avgRating,
    reviewsCount,
    myReview,
    isAuthenticated,
    loading,
    ready = true,
    submitting,
    page,
    lastPage,
    onPageChange,
    onRequireLogin,
    onSubmit,
    onDelete,
}: ReviewsProps) {
    const t = useTranslations();

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t("reviews")}</h2>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-black text-gray-900">{ratingLabel(avgRating)}</span>
                    <span className="text-sm text-gray-500 font-medium">({reviewsCount} {t("reviews")})</span>
                </div>
            </div>

            {!ready ? (
                <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            ) : !isAuthenticated ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                    <p className="text-sm text-gray-500 mb-4">{t("login_to_review")}</p>
                    <Button onClick={onRequireLogin}>{t("login_required")}</Button>
                </div>
            ) : (
                <>
                    <ReviewComposer
                        key={myReview ? String(myReview.id) : "new"}
                        myReview={myReview}
                        submitting={submitting}
                        onSubmit={onSubmit}
                        onDelete={onDelete}
                    />

                    {loading && reviews.length === 0 ? (
                        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-gray-100" />
                    ) : reviews.length === 0 ? (
                        <p className="mt-6 text-sm text-gray-500">{t("no_reviews")}</p>
                    ) : (
                        <div className="mt-6 space-y-6">
                            {reviews.map((rev) => (
                                <div
                                    key={rev.id}
                                    className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {rev.user?.image ? (
                                                <img
                                                    src={rev.user.image}
                                                    alt={rev.user.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white shadow-lg">
                                                    {(rev.user?.name || "?").charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-base font-bold text-gray-900">{rev.user?.name}</p>
                                                <p className="text-xs text-gray-400">{formatReviewDate(rev.created_at)}</p>
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
                                    {rev.comment && (
                                        <p className="text-gray-600 leading-relaxed font-medium italic">&ldquo;{rev.comment}&rdquo;</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {lastPage > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                disabled={page <= 1 || loading}
                                onClick={() => onPageChange(page - 1)}
                                aria-label={t("previous")}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
                            >
                                <ChevronLeft size={16} className="rtl:rotate-180" />
                            </button>
                            <span className="text-sm text-gray-500">{page} / {lastPage}</span>
                            <button
                                type="button"
                                disabled={page >= lastPage || loading}
                                onClick={() => onPageChange(page + 1)}
                                aria-label={t("see_more")}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
                            >
                                <ChevronRight size={16} className="rtl:rotate-180" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

function ReviewComposer({
    myReview,
    submitting,
    onSubmit,
    onDelete,
}: {
    myReview: CenterReview | null;
    submitting?: boolean;
    onSubmit: (payload: { rating: number; comment: string | null }) => void;
    onDelete: () => void;
}) {
    const t = useTranslations();
    const [rating, setRating] = useState(myReview?.rating ?? 0);
    const [comment, setComment] = useState(myReview?.comment ?? "");

    const save = () => {
        if (rating < 1) return;
        onSubmit({ rating, comment: comment.trim() ? comment.trim() : null });
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-900 mb-3">
                {myReview ? t("your_review") : t("write_review")}
            </p>
            <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            aria-label={String(value)}
                            className="p-0.5"
                        >
                            <Star
                                size={22}
                                className={cn(
                                    value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                )}
                            />
                        </button>
                    );
                })}
            </div>
            <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("review_comment_placeholder")}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#225D5C]/30"
            />
            {rating < 1 && (
                <p className="mt-2 text-xs text-gray-400">{t("review_rating_required")}</p>
            )}
            <div className="mt-4 flex items-center gap-3">
                <Button onClick={save} disabled={submitting || rating < 1} size="sm">
                    {t("review_save")}
                </Button>
                {myReview && (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        onClick={() => {
                            if (window.confirm(t("review_delete_confirm"))) onDelete();
                        }}
                    >
                        {t("review_delete")}
                    </Button>
                )}
            </div>
        </div>
    );
}
