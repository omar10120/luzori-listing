"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Package } from "lucide-react";
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

    return (
        <div className="min-h-screen bg-[#F7F5F1] pt-24 pb-20">
            <Container>
                <Link
                    href="/global-products"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#225D5C] hover:underline"
                >
                    <ArrowLeft size={16} className="rtl:rotate-180" />
                    {t("global_products")}
                </Link>

                <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div>
                        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-black/5">
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-square items-center justify-center bg-gray-100 text-gray-400">
                                    <Package size={48} />
                                </div>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto">
                                {gallery.map((src) => (
                                    <button
                                        key={src}
                                        type="button"
                                        onClick={() => setActiveImage(src)}
                                        className={cn(
                                            "h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition",
                                            activeImage === src ? "ring-[#225D5C]" : "ring-transparent opacity-80 hover:opacity-100"
                                        )}
                                    >
                                        <img src={src} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#225D5C]/70">
                            {product.brand_name || product.category_name || t("product_details")}
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {product.name}
                        </h1>
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={14} className="text-[#225D5C]" />
                            <span>
                                {t("product_from_center")} {product.center_name}
                            </span>
                        </div>

                        {price && (
                            <p className="mt-6 text-3xl font-black text-[#225D5C]">{price}</p>
                        )}

                        {(product.short_description || product.text) && (
                            <p className="mt-5 text-base leading-relaxed text-gray-600">
                                {product.short_description || product.text}
                            </p>
                        )}

                        <dl className="mt-8 grid grid-cols-2 gap-4">
                            {product.brand_name && (
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                    <dt className="text-xs text-gray-400">{t("product_brand")}</dt>
                                    <dd className="mt-1 text-sm font-bold text-gray-900">{product.brand_name}</dd>
                                </div>
                            )}
                            {product.category_name && (
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                    <dt className="text-xs text-gray-400">{t("product_category")}</dt>
                                    <dd className="mt-1 text-sm font-bold text-gray-900">{product.category_name}</dd>
                                </div>
                            )}
                            {measure && (
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                    <dt className="text-xs text-gray-400">{t("product_measure")}</dt>
                                    <dd className="mt-1 text-sm font-bold text-gray-900">{measure}</dd>
                                </div>
                            )}
                            {product.primary_sku?.name || product.primary_sku?.id ? (
                                <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                    <dt className="text-xs text-gray-400">{t("product_sku")}</dt>
                                    <dd className="mt-1 text-sm font-bold text-gray-900">
                                        {product.primary_sku.name || `#${product.primary_sku.id}`}
                                    </dd>
                                </div>
                            ) : null}
                        </dl>

                        {product.branches && product.branches.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-sm font-bold text-gray-900">{t("product_branches")}</h2>
                                <ul className="mt-3 space-y-2">
                                    {product.branches.map((branch) => (
                                        <li
                                            key={branch.id}
                                            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-black/5"
                                        >
                                            <span className="font-medium text-gray-800">{branch.name}</span>
                                            <span className="text-gray-500">
                                                {t("product_stock")}: {branch.stock_quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-8">
                            <Link href={`/center/${centerSlug}`}>
                                <Button className="w-full sm:w-auto">{t("view_center")}</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
