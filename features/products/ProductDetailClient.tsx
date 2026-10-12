"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    MapPin,
    Package,
    Tag,
    Ruler,
    Hash,
    Store,
    Check,
    ScanLine,
    Percent,
    CircleDollarSign,
    ShoppingCart,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import type { CenterProductDetail } from "@/lib/apiEndpoints";
import { generateCenterSlug } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { useProductCart } from "@/components/cart/ProductCartContext";
import toast from "react-hot-toast";

interface ProductDetailClientProps {
    product: CenterProductDetail;
}

function formatMoney(value: number | string | null | undefined, currency: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return `${n} ${currency}`;
}

function uniqueImages(...groups: Array<string | null | undefined | string[]>) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const group of groups) {
        const list = Array.isArray(group) ? group : [group];
        for (const src of list) {
            if (!src || seen.has(src)) continue;
            seen.add(src);
            out.push(src);
        }
    }
    return out;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const t = useTranslations();
    const locale = useLocale();
    const currency = t("activity_currency_aed");
    const { addItem, isInCart } = useProductCart();
    const alreadyInCart = isInCart(product.center_id, product.id);

    const translation = product.translations?.find((entry) => entry.locale === locale);
    const displayName = translation?.name || product.name;
    const displayText = translation?.text || product.text || null;
    const shortDescription = product.short_description || null;

    const gallery = useMemo(
        () => uniqueImages(product.image, product.gallery),
        [product.image, product.gallery]
    );
    const [activeImage, setActiveImage] = useState(gallery[0] || "");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const retailPrice = formatMoney(product.retail_price, currency);
    const supplyPrice = formatMoney(product.supply_price, currency);
    const markup = formatMoney(product.markup, currency);
    const centerSlug = generateCenterSlug(product.center_name, product.center_id);
    const measure =
        product.measure_amount != null && product.measure_unit
            ? `${Number(product.measure_amount)} ${product.measure_unit}`
            : null;

    const specs = [
        product.brand_name && { icon: Tag, label: t("product_brand"), value: product.brand_name },
        product.category_name && { icon: Store, label: t("product_category"), value: product.category_name },
        measure && { icon: Ruler, label: t("product_measure"), value: measure },
        product.barcode && { icon: ScanLine, label: t("product_barcode"), value: product.barcode },
        retailPrice && { icon: CircleDollarSign, label: t("product_retail_price"), value: retailPrice },
        supplyPrice && { icon: CircleDollarSign, label: t("product_supply_price"), value: supplyPrice },
        markup && { icon: Percent, label: t("product_markup"), value: markup },
        {
            icon: Check,
            label: t("product_retail_sales"),
            value: product.allow_retail_sales ? t("product_yes") : t("product_no"),
        },
        {
            icon: Package,
            label: t("product_track_stock"),
            value: product.track_stock ? t("product_yes") : t("product_no"),
        },
        (product.primary_sku?.name || product.primary_sku?.id) && {
            icon: Hash,
            label: t("product_sku"),
            value: product.primary_sku.name || `#${product.primary_sku.id}`,
        },
    ].filter(Boolean) as {
        icon: React.ComponentType<{ size?: number; className?: string }>;
        label: string;
        value: string;
    }[];

    const totalStock = product.branches?.reduce(
        (sum, branch) => sum + (Number(branch.stock_quantity) || 0),
        0
    );
    const skus = product.skus?.length ? product.skus : product.primary_sku ? [product.primary_sku] : [];

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

                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
                    <div className="lg:sticky lg:top-24 space-y-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (!activeImage) return;
                                const index = Math.max(0, gallery.indexOf(activeImage));
                                setLightboxIndex(index);
                            }}
                            className="w-full overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5 text-left"
                        >
                            <div className="overflow-hidden rounded-xl bg-[#EAF1F0]">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={displayName}
                                        className="aspect-square w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-square items-center justify-center text-gray-400">
                                        <Package size={36} />
                                    </div>
                                )}
                            </div>
                        </button>

                        {gallery.length > 0 && (
                            <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                    {t("product_gallery")} ({gallery.length})
                                </p>
                                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                    {gallery.map((src, index) => (
                                        <button
                                            key={`${src}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImage(src)}
                                            onDoubleClick={() => setLightboxIndex(index)}
                                            className={cn(
                                                "aspect-square overflow-hidden rounded-xl ring-2 transition",
                                                activeImage === src
                                                    ? "ring-[#225D5C]"
                                                    : "ring-transparent opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            <img
                                                src={src}
                                                alt={`${displayName} ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#225D5C]/70">
                                        {product.brand_name || product.category_name || t("product_details")}
                                    </p>
                                    <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                        {displayName}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin size={12} className="text-[#225D5C]" />
                                            {t("product_from_center")} {product.center_name}
                                        </span>
                                        {product.center_domain && (
                                            <span className="text-gray-400">{product.center_domain}</span>
                                        )}
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
                                {retailPrice && (
                                    <div className="shrink-0 rounded-xl bg-[#225D5C] px-3 py-2 text-right">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#FFD6A8]/80">
                                            {t("product_price")}
                                        </p>
                                        <p className="text-lg font-black text-[#FFD6A8]">{retailPrice}</p>
                                    </div>
                                )}
                            </div>

                            {shortDescription && (
                                <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-medium leading-relaxed text-gray-700">
                                    {shortDescription}
                                </p>
                            )}
                            {displayText && displayText !== shortDescription && (
                                <div className={cn(shortDescription ? "mt-3" : "mt-4 border-t border-gray-100 pt-4")}>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                        {t("product_description")}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{displayText}</p>
                                </div>
                            )}
                        </div>

                        {specs.length > 0 && (
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {specs.map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
                                    >
                                        <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-400">
                                            <Icon size={11} className="text-[#225D5C]/70" />
                                            {label}
                                        </dt>
                                        <dd className="mt-1 break-words text-xs font-bold text-gray-900">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </div>
                        )}

                        {skus.length > 0 && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                                <h2 className="text-xs font-bold text-gray-900">{t("product_skus")}</h2>
                                <ul className="mt-3 space-y-1.5">
                                    {skus.map((sku) => (
                                        <li
                                            key={sku.id}
                                            className="flex items-center justify-between rounded-lg bg-[#F7F5F1] px-3 py-2 text-xs"
                                        >
                                            <span className="font-medium text-gray-800">
                                                {sku.name || sku.sku || `#${sku.id}`}
                                            </span>
                                            <span className="text-gray-500">
                                                {sku.type || "sku"}
                                                {sku.price != null && sku.price !== ""
                                                    ? ` · ${formatMoney(sku.price, currency)}`
                                                    : ""}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

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
                                                {t("product_stock")}: {branch.stock_quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {gallery.length > 0 && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                                <h2 className="text-xs font-bold text-gray-900">
                                    {t("product_gallery")}
                                </h2>
                                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {gallery.map((src, index) => (
                                        <button
                                            key={`full-${src}-${index}`}
                                            type="button"
                                            onClick={() => {
                                                setActiveImage(src);
                                                setLightboxIndex(index);
                                            }}
                                            className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/5"
                                        >
                                            <img
                                                src={src}
                                                alt={`${displayName} ${index + 1}`}
                                                className="h-full w-full object-cover transition hover:scale-105"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    addItem({
                                        productId: product.id,
                                        centerId: product.center_id,
                                        centerName: product.center_name,
                                        name: displayName,
                                        price: Number(product.retail_price) || 0,
                                        image: product.image || product.gallery?.[0] || null,
                                    });
                                    toast.success(t("cart_added"));
                                }}
                            >
                                <ShoppingCart size={14} className="mr-1.5" />
                                {alreadyInCart ? t("cart_add_again") : t("add_to_cart")}
                            </Button>
                            <Link href={`/center/${centerSlug}`} className="block">
                                <Button size="sm" variant="outline" className="w-full sm:w-auto">
                                    {t("view_center")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>

            {lightboxIndex != null && gallery[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        type="button"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white disabled:opacity-40"
                        disabled={lightboxIndex <= 0}
                        onClick={(event) => {
                            event.stopPropagation();
                            setLightboxIndex((current) => Math.max(0, (current ?? 0) - 1));
                        }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <img
                        src={gallery[lightboxIndex]}
                        alt={`${displayName} ${lightboxIndex + 1}`}
                        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white disabled:opacity-40"
                        disabled={lightboxIndex >= gallery.length - 1}
                        onClick={(event) => {
                            event.stopPropagation();
                            setLightboxIndex((current) =>
                                Math.min(gallery.length - 1, (current ?? 0) + 1)
                            );
                        }}
                    >
                        <ArrowLeft size={18} className="rotate-180" />
                    </button>
                    <p className="absolute bottom-6 text-sm text-white/80">
                        {lightboxIndex + 1} / {gallery.length}
                    </p>
                </div>
            )}
        </div>
    );
}
