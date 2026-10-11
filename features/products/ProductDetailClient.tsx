"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Tag, Ruler, Hash, Store, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import type { CenterProductDetail } from "@/lib/apiEndpoints";
import { generateCenterSlug } from "@/lib/slugify";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
    product: CenterProductDetail;
}

function formatMoney(value: number | string | null | undefined, currency: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return `${n} ${currency}`;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const t = useTranslations();
    const gallery = (product.gallery?.filter(Boolean) || []).length
        ? product.gallery!.filter(Boolean)
        : product.image
            ? [product.image]
            : [];
    const [activeImage, setActiveImage] = useState(gallery[0] || "");
    const price = formatMoney(product.retail_price, t("activity_currency_aed"));
    const centerSlug = generateCenterSlug(product.center_name, product.center_id);
    const measure =
        product.measure_amount && product.measure_unit
            ? `${Number(product.measure_amount)} ${product.measure_unit}`
            : null;

    const specs = [
        product.brand_name && { icon: Tag, label: t("product_brand"), value: product.brand_name },
        product.category_name && { icon: Store, label: t("product_category"), value: product.category_name },
        measure && { icon: Ruler, label: t("product_measure"), value: measure },
        (product.primary_sku?.name || product.primary_sku?.id) && {
            icon: Hash,
            label: t("product_sku"),
            value: product.primary_sku.name || `#${product.primary_sku.id}`,
        },
    ].filter(Boolean) as { icon: any; label: string; value: string }[];

    const totalStock = product.branches?.reduce(
        (sum, b) => sum + (Number(b.stock_quantity) || 0),
        0
    );

    return (
        <div className="min-h-screen bg-[#F7F5F1] pt-20 pb-16">
            <Container className="max-w-5xl">
                <Link
                    href="/global-products"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#225D5C] hover:underline"
                >
                    <ArrowLeft size={14} className="rtl:rotate-180" />
                    {t("global_products")}
                </Link>

                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
                    {/* Gallery */}
                    <div className="lg:sticky lg:top-24">
                        <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                            <div className="overflow-hidden rounded-xl bg-[#EAF1F0]">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={product.name}
                                        className="aspect-square w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-square items-center justify-center text-gray-400">
                                        <Package size={36} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {gallery.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                {gallery.map((src) => (
                                    <button
                                        key={src}
                                        type="button"
                                        onClick={() => setActiveImage(src)}
                                        className={cn(
                                            "h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                                            activeImage === src
                                                ? "ring-[#225D5C]"
                                                : "ring-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={src} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info panel */}
                    <div className="flex flex-col gap-5">
                        {/* Header card */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#225D5C]/70">
                                        {product.brand_name || product.category_name || t("product_details")}
                                    </p>
                                    <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                        {product.name}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin size={12} className="text-[#225D5C]" />
                                            {t("product_from_center")} {product.center_name}
                                        </span>
                                        {totalStock != null && (
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                                    totalStock > 0
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-600"
                                                )}
                                            >
                                                <Check size={10} />
                                                {t("product_stock")}: {totalStock}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {price && (
                                    <div className="shrink-0 rounded-xl bg-[#225D5C] px-3 py-2 text-right">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#FFD6A8]/80">
                                            {t("product_price") || "Price"}
                                        </p>
                                        <p className="text-lg font-black text-[#FFD6A8]">{price}</p>
                                    </div>
                                )}
                            </div>

                            {(product.short_description || product.text) && (
                                <p className="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600">
                                    {product.short_description || product.text}
                                </p>
                            )}
                        </div>

                        {/* Specs */}
                        {specs.length > 0 && (
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                {specs.map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
                                    >
                                        <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-400">
                                            <Icon size={11} className="text-[#225D5C]/70" />
                                            {label}
                                        </dt>
                                        <dd className="mt-1 truncate text-xs font-bold text-gray-900">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Branches */}
                        {product.branches && product.branches.length > 0 && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-bold text-gray-900">
                                        {t("product_branches")}
                                    </h2>
                                    <span className="text-[10px] text-gray-400">
                                        {product.branches.length}
                                    </span>
                                </div>
                                <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                    {product.branches.map((branch) => (
                                        <li
                                            key={branch.id}
                                            className="flex items-center justify-between rounded-lg bg-[#F7F5F1] px-3 py-2 text-xs"
                                        >
                                            <span className="truncate font-medium text-gray-800">
                                                {branch.name}
                                            </span>
                                            <span
                                                className={cn(
                                                    "ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                                    Number(branch.stock_quantity) > 0
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-600"
                                                )}
                                            >
                                                {branch.stock_quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA */}
                        <div>
                            <Link href={`/center/${centerSlug}`} className="block">
                                <Button size="sm" className="w-full sm:w-auto">
                                    {t("view_center")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}