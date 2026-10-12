"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, X } from "lucide-react";
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

export default function ProductCartButton({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const { items, count, removeItem } = useProductCart();
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
                      {group.items.map((item) => (
                        <li key={item.key} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-200">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-gray-900">{item.name}</p>
                            <p className="text-[11px] text-gray-500">
                              {formatPrice(item.price)}
                              {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-red-500"
                            aria-label={t("cart_remove")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
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
