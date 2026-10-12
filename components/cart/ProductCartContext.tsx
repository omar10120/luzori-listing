"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductCartItem } from "@/lib/productCartTypes";

export type { ProductCartItem };

const STORAGE_KEY = "luzori_product_cart_v1";

interface ProductCartContextValue {
  items: ProductCartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<ProductCartItem, "key" | "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  clearCenter: (centerId: number) => void;
  clearAll: () => void;
  itemsByCenter: (centerId: number) => ProductCartItem[];
  isInCart: (centerId: number, productId: number) => boolean;
}

const ProductCartContext = createContext<ProductCartContextValue | null>(null);

function makeKey(centerId: number, productId: number) {
  return `${centerId}:${productId}`;
}

function readStorage(): ProductCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ProductCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductCartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<ProductCartItem, "key" | "quantity"> & { quantity?: number }) => {
      const key = makeKey(item.centerId, item.productId);
      setItems((prev) => {
        const existing = prev.find((row) => row.key === key);
        if (existing) {
          return prev.map((row) =>
            row.key === key
              ? { ...row, quantity: row.quantity + (item.quantity || 1) }
              : row
          );
        }
        return [
          ...prev,
          {
            ...item,
            key,
            quantity: item.quantity || 1,
            price: Number(item.price) || 0,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((row) => row.key !== key));
  }, []);

  const clearCenter = useCallback((centerId: number) => {
    setItems((prev) => prev.filter((row) => row.centerId !== centerId));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const itemsByCenter = useCallback(
    (centerId: number) => items.filter((row) => row.centerId === centerId),
    [items]
  );

  const isInCart = useCallback(
    (centerId: number, productId: number) =>
      items.some((row) => row.centerId === centerId && row.productId === productId),
    [items]
  );

  const value = useMemo<ProductCartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, row) => sum + row.quantity, 0),
      total: items.reduce((sum, row) => sum + row.price * row.quantity, 0),
      addItem,
      removeItem,
      clearCenter,
      clearAll,
      itemsByCenter,
      isInCart,
    }),
    [items, addItem, removeItem, clearCenter, clearAll, itemsByCenter, isInCart]
  );

  return <ProductCartContext.Provider value={value}>{children}</ProductCartContext.Provider>;
}

export function useProductCart() {
  const ctx = useContext(ProductCartContext);
  if (!ctx) {
    throw new Error("useProductCart must be used within ProductCartProvider");
  }
  return ctx;
}
