"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import ProductCard from "@/features/products/ProductCard";
import { fetchGlobalProducts } from "@/lib/api";
import type { GlobalProductListItem } from "@/lib/apiEndpoints";

const HOME_LIMIT = 10;

export default function GlobalProductsSection() {
    const t = useTranslations();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<GlobalProductListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const result = await fetchGlobalProducts(1, 30);
            if (cancelled) return;
            setProducts(result.products.slice(0, HOME_LIMIT));
            setTotal(result.pagination.total);
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -280 : 280,
            behavior: "smooth",
        });
    };

    if (loading) {
        return (
            <section className="py-8 sm:py-10">
                <Container>
                    <div className="h-8 w-48 animate-pulse rounded-full bg-white/20" />
                    <div className="mt-6 flex gap-4 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-72 w-56 shrink-0 animate-pulse rounded-3xl bg-white/15" />
                        ))}
                    </div>
                </Container>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="relative overflow-hidden py-8 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,214,168,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(34,93,92,0.12),_transparent_50%)]" />
            <Container className="relative">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-bold uppercase tracking-[0.2em] text-[#225D5C]/70"
                        >
                            {t("product_details")}
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-1 text-2xl font-bold tracking-tight text-[#225D5C] sm:text-3xl"
                        >
                            {t("global_products")}
                        </motion.h2>
                        <p className="mt-1 text-sm text-gray-600">{t("global_products_subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {total > HOME_LIMIT && (
                            <Link
                                href="/global-products"
                                className="mr-1 text-sm font-bold text-[#225D5C] hover:underline"
                            >
                                {t("see_more")}
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            aria-label="Scroll left"
                            className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#225D5C] text-[#FFD6A8] transition hover:bg-[#1a4a49] sm:flex"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            aria-label="Scroll right"
                            className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#225D5C] text-[#FFD6A8] transition hover:bg-[#1a4a49] sm:flex"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </Container>

            <div className="relative mt-6">
                <div
                    ref={scrollRef}
                    className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-2 scroll-px-4 sm:px-6 sm:scroll-px-6 lg:px-8 lg:scroll-px-8 snap-x snap-mandatory"
                >
                    {products.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: Math.min(index * 0.05, 0.25) }}
                            className="snap-start shrink-0"
                        >
                            <ProductCard item={item} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
