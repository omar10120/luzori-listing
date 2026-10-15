"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { fetchBuyProductOrders, fetchUserProfile } from "@/lib/api";
import type {
  BuyProductOrder,
  BuyProductOrdersPagination,
} from "@/lib/apiEndpoints";
import { generateCenterSlug } from "@/lib/slugify";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop";

type CenterOption = { id: number; name: string };

function formatMoney(amount: number | string | null | undefined, currency: string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return `0 ${currency}`;
  return `${n} ${currency}`;
}

function formatOrderDate(value: string, locale: string) {
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(locale === "ar" ? "ar-AE" : "en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function paymentLabel(type: string, t: ReturnType<typeof useTranslations>): string {
  switch (type) {
    case "wallet":
      return t("wallet");
    case "service_visa":
      return t("service_visa");
    case "sales_cash":
      return t("product_order_payment_card");
    default:
      return type.replace(/_/g, " ");
  }
}

function mergeCenters(prev: CenterOption[], orders: BuyProductOrder[]): CenterOption[] {
  const map = new Map<number, string>();
  for (const c of prev) map.set(c.id, c.name);
  for (const order of orders) {
    const id = Number(order.center?.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    map.set(id, order.center?.name || `#${id}`);
  }
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

type GroupedProductLine = {
  key: string;
  productId: number;
  name: string;
  imageUrl: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

/** Collapse duplicate product rows (API may emit one row per unit) into qty lines. */
function groupOrderProducts(order: BuyProductOrder): GroupedProductLine[] {
  const products = Array.isArray(order.products) ? order.products : [];
  const map = new Map<number, GroupedProductLine>();

  for (const product of products) {
    const productId = Number(product.product_id);
    const unitPrice = Number(product.price) || 0;
    const rowQty = Math.max(1, Math.floor(Number(product.qty) || 1));
    const existing = map.get(productId);

    if (existing) {
      existing.qty += rowQty;
      existing.lineTotal = existing.unitPrice * existing.qty;
      if (!existing.imageUrl && product.image_url) existing.imageUrl = product.image_url;
      continue;
    }

    map.set(productId, {
      key: String(productId || product.id),
      productId,
      name: product.name,
      imageUrl: product.image_url ?? null,
      qty: rowQty,
      unitPrice,
      lineTotal: unitPrice * rowQty,
    });
  }

  const grouped = Array.from(map.values());

  // Single product order: prefer order-level qty when rows were expanded 1:1.
  if (
    grouped.length === 1 &&
    Number(order.qty) > 0 &&
    grouped[0].qty !== Number(order.qty) &&
    products.length === Number(order.qty)
  ) {
    grouped[0].qty = Math.floor(Number(order.qty));
    grouped[0].unitPrice =
      Number(order.unit_price) || grouped[0].unitPrice;
    grouped[0].lineTotal =
      Number(order.subtotal) ||
      Number(order.total) ||
      grouped[0].unitPrice * grouped[0].qty;
  }

  return grouped;
}

interface ProductOrdersClientProps {
  onUserLoaded?: (name?: string) => void;
}

export default function ProductOrdersClient({ onUserLoaded }: ProductOrdersClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const currency = t("activity_currency_aed");
  const onUserLoadedRef = useRef(onUserLoaded);
  onUserLoadedRef.current = onUserLoaded;

  const [orders, setOrders] = useState<BuyProductOrder[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [centerId, setCenterId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<BuyProductOrdersPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [booting, setBooting] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const profileReady = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      if (!profileReady.current) {
        setBooting(true);
      } else {
        setListLoading(true);
      }

      try {
        if (!profileReady.current) {
          const profile = await fetchUserProfile(token);
          if (cancelled) return;
          if (!profile) {
            localStorage.removeItem("authToken");
            router.push("/login");
            return;
          }
          profileReady.current = true;
          onUserLoadedRef.current?.(profile.name);
        }

        const result = await fetchBuyProductOrders(token, {
          center_id: centerId ?? undefined,
          page,
        });
        if (cancelled) return;

        if (!result.success) {
          toast.error(result.message || t("product_orders_load_failed"));
          setOrders([]);
          return;
        }

        setOrders(result.orders);
        setPagination(result.pagination);
        setCenters((prev) => mergeCenters(prev, result.orders));
      } finally {
        if (!cancelled) {
          setBooting(false);
          setListLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [centerId, page, router, t]);

  const filterLabel = useMemo(() => {
    if (!centerId) return t("product_orders_all_centers");
    return centers.find((c) => c.id === centerId)?.name || t("product_orders_all_centers");
  }, [centerId, centers, t]);

  if (booting) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#225D5C]" />
      </div>
    );
  }

  const empty = !listLoading && orders.length === 0;
  const hasPages = pagination.last_page > 1;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("product_orders")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("product_orders_subtitle", { count: pagination.total })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="shrink-0 text-[#225D5C]" />
          <label className="sr-only" htmlFor="product-orders-center">
            {t("product_orders_filter_center")}
          </label>
          <select
            id="product-orders-center"
            value={centerId ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              setPage(1);
              setCenterId(raw ? Number(raw) : null);
            }}
            className="min-w-[12rem] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none ring-[#225D5C]/20 focus:ring-2"
          >
            <option value="">{t("product_orders_all_centers")}</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {listLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#225D5C]" />
        </div>
      ) : empty ? (
        <div className="rounded-2xl border border-dashed border-[#225D5C]/30 bg-white p-12 text-center">
          <ShoppingBag className="mx-auto mb-3 text-[#225D5C]/50" size={32} />
          <p className="font-medium text-gray-900">{t("product_orders_empty")}</p>
          <p className="mt-1 text-sm text-gray-500">
            {centerId
              ? t("product_orders_empty_filtered", { center: filterLabel })
              : t("product_orders_empty_hint")}
          </p>
          <Button className="mt-6" onClick={() => router.push("/global-products")}>
            {t("global_products")}
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const center = order.center;
            const centerHref = center
              ? `/center/${generateCenterSlug(center.name, center.id)}`
              : null;
            const lines = groupOrderProducts(order);
            const soldQty = Math.max(
              Number(order.qty) || 0,
              Number(order.items_count) || 0,
              lines.reduce((sum, line) => sum + line.qty, 0)
            );
            const thumb =
              lines.find((line) => line.imageUrl)?.imageUrl || center?.logo || FALLBACK;

            return (
              <li
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#EAF1F0]">
                    <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          #{order.sale_id ?? order.id}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900">
                          {formatOrderDate(order.created_at, locale)}
                        </p>
                        {center && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={12} className="shrink-0 text-[#225D5C]" />
                            {centerHref ? (
                              <Link
                                href={centerHref}
                                className="font-medium text-[#225D5C] hover:underline"
                              >
                                {center.name}
                              </Link>
                            ) : (
                              <span>{center.name}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-[#225D5C]">
                          {formatMoney(order.total, currency)}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                          {paymentLabel(order.payment_type, t)}
                          {soldQty > 0
                            ? ` · ${t("product_order_qty", { qty: soldQty })}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {lines.map((line) => (
                        <li
                          key={line.key}
                          className="flex items-center gap-3 rounded-xl bg-[#F7F5F1] px-3 py-2"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
                            {line.imageUrl ? (
                              <img
                                src={line.imageUrl}
                                alt={line.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Package size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {line.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {formatMoney(line.unitPrice, currency)}
                              {line.qty > 1 ? ` × ${line.qty}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            {line.qty > 1 && (
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#225D5C]">
                                {t("product_order_qty", { qty: line.qty })}
                              </p>
                            )}
                            <p className="text-sm font-bold text-gray-800">
                              {formatMoney(line.lineTotal, currency)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {(order.sales_worker?.name || order.worker?.name) && (
                      <p className="text-xs text-gray-500">
                        {t("product_order_handled_by")}{" "}
                        <span className="font-medium text-gray-700">
                          {order.sales_worker?.name || order.worker?.name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasPages && !empty && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || listLoading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            aria-label={t("previous")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
            )}
          >
            <ChevronLeft size={16} className="rtl:rotate-180" />
          </button>
          <span className="text-sm text-gray-500">
            {pagination.current_page} / {pagination.last_page}
          </span>
          <button
            type="button"
            disabled={page >= pagination.last_page || listLoading}
            onClick={() => setPage((current) => current + 1)}
            aria-label={t("see_more")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
          >
            <ChevronRight size={16} className="rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
