"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { GlobalProductListItem } from "@/lib/apiEndpoints";
import { cn } from "@/lib/utils";

const FALLBACK =
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop";

function formatPrice(value: number | string | null | undefined, currency: string) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return `${n} ${currency}`;
}

interface ProductCardProps {
    item: GlobalProductListItem;
    className?: string;
    compact?: boolean;
}

export default function ProductCard({ item, className, compact }: ProductCardProps) {
    const t = useTranslations();
    const product = item.product;
    const image = product?.image_url || FALLBACK;
    const price = formatPrice(product?.retail_price, t("activity_currency_aed"));
    const href = `/global-products/${item.center_id}/${item.product_id}`;

    return (
        <Link href={href} className={cn("block", className)}>
            <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-lg hover:ring-[#225D5C]/20 transition-shadow",
                    compact ? "w-full" : "w-40 sm:w-44"
                )}
            >
                <div className="relative aspect-square overflow-hidden bg-[#EAF1F0]">
                    <img
                        src={image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    {product?.brand && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#225D5C]">
                            {product.brand}
                        </span>
                    )}
                    {price && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-[#225D5C] px-2 py-0.5 text-[10px] font-bold text-[#FFD6A8]">
                            {price}
                        </span>
                    )}
                </div>
                <div className="p-2.5">
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                        {item.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin size={10} className="shrink-0 text-[#225D5C]" />
                        <span className="line-clamp-1">
                            {t("product_from_center")} {item.center_name}
                        </span>
                    </div>
                    {product?.category && (
                        <p className="mt-0.5 text-[10px] text-gray-400 line-clamp-1">
                            {product.category}
                        </p>
                    )}
                </div>
            </motion.article>
        </Link>
    );
}