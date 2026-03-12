"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import RatingStars from "@/components/ui/RatingStars";
import { reviews } from "@/data/mockData";
import { REVIEWS_HEADING } from "@/lib/constants";
import type { Review } from "@/lib/types";
import { useTranslations } from "next-intl";

interface ReviewCardProps {
    review: Review;
    index: number;
}
const ReviewCard: React.FC<ReviewCardProps> = ({ review, index }) => {


    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
        >
            <RatingStars rating={review.rating} size={14} />
            <h3 className="mt-3 text-sm font-semibold text-gray-900">
                {review.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
                {review.content}
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-gray-50 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-xs font-semibold text-purple-700">
                    {review.author.avatar}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {review.author.name}
                    </p>
                    <p className="text-xs text-gray-400">{review.author.location}</p>
                </div>
            </div>
        </motion.article>
    );
};

const ReviewsSection: React.FC = () => {
    const t = useTranslations();
    return (
        <section className="py-16 sm:py-24">
            <Container>
                <SectionHeader heading={t('reviews')} />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {reviews.map((review, i) => (
                        <ReviewCard key={review.id} review={review} index={i} />
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default ReviewsSection;
