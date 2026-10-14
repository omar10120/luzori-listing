"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, X, Minus, Plus, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useProductCart } from "@/components/cart/ProductCartContext";
import { cartTotal } from "@/lib/productPayment";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
  }).format(amount);
}

function stockLimitOf(stock: number | null | undefined): number | null {
  if (stock === null || stock === undefined) return null;
  const n = Number(stock);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export default function ProductCartButton({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const { items, count, incrementQuantity, decrementQuantity } = useProductCart();
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<number, { centerId: number; centerName: string; items: typeof items }>();
    for (const item of items) {
      const existing = map.get(item.centerId);
      if (existing) existing.items.push(item);
      else map.set(item.centerId, { centerId: item.centerId, centerName: item.centerName, items: [item] });
    }
    return Array.from(map.values());
  }, [items]);

  const goCheckout = (centerId: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error(t("login_required"));
      setOpen(false);
      router.push(`/login?redirect=${encodeURIComponent(`/checkout/${centerId}`)}`);
      return;
    }
    setOpen(false);
    router.push(`/checkout/${centerId}`);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("cart")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-gray-800 transition hover:bg-white"
      >
        <ShoppingCart size={18} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#225D5C] px-1 text-[10px] font-bold text-[#FFD6A8]">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-bold text-gray-900">{t("cart")}</p>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={16} />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-gray-500">{t("cart_empty")}</p>
            ) : (
              <div className="max-h-[70vh] space-y-4 overflow-y-auto">
                {groups.map((group) => (
                  <div key={group.centerId} className="rounded-xl border border-gray-100 p-2">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-xs font-bold text-[#225D5C]">{group.centerName}</p>
                      <span className="text-[10px] text-gray-400">
                        {formatPrice(cartTotal(group.items))}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {group.items.map((item) => {
                        const limit = stockLimitOf(item.stock);
                        const atMax = limit != null && item.quantity >= limit;

                        return (
                          <li
                            key={item.key}
                            className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {formatPrice(item.price)}
                                {item.quantity > 1
                                  ? ` · ${formatPrice(item.price * item.quantity)}`
                                  : ""}
                                {limit != null ? ` · ${item.quantity}/${limit}` : ""}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-gray-200 bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  void (async () => {
                                    const result = await decrementQuantity(item.key);
                                    if (!result.ok && result.message !== "login_required") {
                                      toast.error(result.message);
                                    }
                                  })();
                                }}
                                aria-label={
                                  item.quantity === 1 ? t("cart_remove") : t("cart_decrease")
                                }
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full transition",
                                  item.quantity === 1
                                    ? "text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                )}
                              >
                                {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                              </button>
                              <span className="min-w-[1.25rem] text-center text-xs font-bold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={atMax}
                                onClick={() => {
                                  if (atMax) {
                                    toast.error(t("product_stock_limit_reached_short"));
                                    return;
                                  }
                                  void (async () => {
                                    const result = await incrementQuantity(item.key);
                                    if (!result.ok) {
                                      toast.error(
                                        result.message === "product_stock_limit_reached_short"
                                          ? t("product_stock_limit_reached_short")
                                          : result.message
                                      );
                                    }
                                  })();
                                }}
                                aria-label={
                                  atMax
                                    ? t("product_stock_limit_reached_short")
                                    : t("cart_increase")
                                }
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full transition",
                                  atMax
                                    ? "cursor-not-allowed text-gray-400 opacity-40"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                )}
                              >
                                {atMax ? <Lock size={12} /> : <Plus size={12} />}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => goCheckout(group.centerId)}
                    >
                      {t("cart_checkout")}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <Link
                href="/global-products"
                onClick={() => setOpen(false)}
                className="mt-3 block text-center text-xs font-semibold text-[#225D5C] hover:underline"
              >
                {t("global_products")}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
