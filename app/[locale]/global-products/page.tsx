"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import ProductCard from "@/features/products/ProductCard";
import { fetchGlobalProducts } from "@/lib/api";
import type { GlobalProductListItem, GlobalProductsPagination } from "@/lib/apiEndpoints";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GlobalProductsPage() {
    const t = useTranslations();
    const [products, setProducts] = useState<GlobalProductListItem[]>([]);
    const [pagination, setPagination] = useState<GlobalProductsPagination>({
        current_page: 1,
        last_page: 1,
        per_page: 30,
        total: 0,
    });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        void (async () => {
            const result = await fetchGlobalProducts(page, 30);
            if (cancelled) return;
            setProducts(result.products);
            setPagination(result.pagination);
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [page]);

    return (
        <div className="min-h-screen bg-[#F7F5F1] pt-24 pb-20">
            <Container>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#225D5C]/70">{t("product_details")}</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#225D5C]">{t("global_products")}</h1>
                <p className="mt-2 text-sm text-gray-600">{t("global_products_subtitle")}</p>

                {loading ? (
                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-white" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="mt-12 rounded-3xl border border-dashed border-[#225D5C]/30 bg-white p-12 text-center text-gray-500">
                        {t("global_products_empty")}
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {products.map((item) => (
                                <ProductCard key={item.id} item={item} compact className="w-full" />
                            ))}
                        </div>

                        {pagination.last_page > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    aria-label={t("previous")}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#225D5C] text-[#FFD6A8] disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} className="rtl:rotate-180" />
                                </button>
                                <span className="text-sm text-gray-600">
                                    {pagination.current_page} / {pagination.last_page}
                                </span>
                                <button
                                    type="button"
                                    disabled={page >= pagination.last_page}
                                    onClick={() => setPage((current) => current + 1)}
                                    aria-label={t("see_more")}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#225D5C] text-[#FFD6A8] disabled:opacity-40"
                                >
                                    <ChevronRight size={18} className="rtl:rotate-180" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
}
