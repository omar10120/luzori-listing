"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ProductCartItem } from "@/lib/productCartTypes";

export type { ProductCartItem };

const STORAGE_KEY = "luzori_product_cart_v1";

/* ------------------------------------------------------------------ */
/* External store (localStorage-backed)                                */
/* ------------------------------------------------------------------ */

let cachedRaw: string | null = null;
let cachedItems: ProductCartItem[] = [];
const listeners = new Set<() => void>();

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseItems(raw: string | null): ProductCartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSnapshot(): ProductCartItem[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  cachedItems = parseItems(raw);
  return cachedItems;
}

function getServerSnapshot(): ProductCartItem[] {
  return [];
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function writeItems(next: ProductCartItem[]) {
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cachedItems = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      /* ignore quota / privacy mode errors */
    }
  }
  listeners.forEach((cb) => cb());
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeKey(centerId: number, productId: number) {
  return `${centerId}:${productId}`;
}

/** Returns max qty when stock is tracked; null means unlimited. */
function getStockLimit(item: Pick<ProductCartItem, "stock">): number | null {
  if (item.stock === null || item.stock === undefined) return null;
  const n = Number(item.stock);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function capQuantity(quantity: number, limit: number | null): number {
  const next = Math.max(1, Math.floor(quantity));
  if (limit == null) return next;
  if (limit <= 0) return 0;
  return Math.min(next, limit);
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface ProductCartContextValue {
  items: ProductCartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<ProductCartItem, "key" | "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  incrementQuantity: (key: string, step?: number) => void;
  decrementQuantity: (key: string, step?: number) => void;
  clearCenter: (centerId: number) => void;
  clearAll: () => void;
  itemsByCenter: (centerId: number) => ProductCartItem[];
  isInCart: (centerId: number, productId: number) => boolean;
  getQuantity: (centerId: number, productId: number) => number;
}

const ProductCartContext = createContext<ProductCartContextValue | null>(null);

export function ProductCartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (item: Omit<ProductCartItem, "key" | "quantity"> & { quantity?: number }) => {
      const key = makeKey(item.centerId, item.productId);
      const prev = getSnapshot();
      const existing = prev.find((row) => row.key === key);
      const incomingQty = item.quantity || 1;
      const incomingStock =
        item.stock === undefined ? undefined : getStockLimit({ stock: item.stock });

      if (existing) {
        const limit =
          incomingStock !== undefined ? incomingStock : getStockLimit(existing);
        if (limit != null && limit <= 0) return;

        const nextQty = existing.quantity + incomingQty;
        const capped = capQuantity(nextQty, limit);
        if (capped < 1) return;

        writeItems(
          prev.map((row) =>
            row.key === key
              ? {
                  ...row,
                  quantity: capped,
                  stock: incomingStock !== undefined ? incomingStock : row.stock,
                  branchId: item.branchId ?? row.branchId,
                }
              : row
          )
        );
        return;
      }

      const limit = incomingStock !== undefined ? incomingStock : getStockLimit(item);
      if (limit != null && limit <= 0) return;

      const initialQty = capQuantity(incomingQty, limit);
      if (initialQty < 1) return;

      writeItems([
        ...prev,
        {
          ...item,
          key,
          quantity: initialQty,
          price: Number(item.price) || 0,
          stock: limit,
        },
      ]);
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    const prev = getSnapshot();
    writeItems(prev.filter((row) => row.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const prev = getSnapshot();
    const target = prev.find((row) => row.key === key);
    if (!target) return;

    const limit = getStockLimit(target);
    let next = Math.floor(quantity);
    if (!Number.isFinite(next) || next < 1) {
      writeItems(prev.filter((row) => row.key !== key));
      return;
    }
    next = capQuantity(next, limit);
    if (next < 1) {
      writeItems(prev.filter((row) => row.key !== key));
      return;
    }

    writeItems(prev.map((row) => (row.key === key ? { ...row, quantity: next } : row)));
  }, []);

  const incrementQuantity = useCallback((key: string, step = 1) => {
    const prev = getSnapshot();
    const target = prev.find((row) => row.key === key);
    if (!target) return;

    const limit = getStockLimit(target);
    if (limit != null && target.quantity >= limit) return;

    const capped = capQuantity(target.quantity + step, limit);
    if (capped < 1 || capped === target.quantity) return;

    writeItems(prev.map((row) => (row.key === key ? { ...row, quantity: capped } : row)));
  }, []);

  const decrementQuantity = useCallback((key: string, step = 1) => {
    const prev = getSnapshot();
    const target = prev.find((row) => row.key === key);
    if (!target) return;

    const nextQty = target.quantity - step;
    if (nextQty < 1) {
      writeItems(prev.filter((row) => row.key !== key));
      return;
    }
    writeItems(prev.map((row) => (row.key === key ? { ...row, quantity: nextQty } : row)));
  }, []);

  const clearCenter = useCallback((centerId: number) => {
    const prev = getSnapshot();
    writeItems(prev.filter((row) => row.centerId !== centerId));
  }, []);

  const clearAll = useCallback(() => {
    writeItems([]);
  }, []);

  const itemsByCenter = useCallback(
    (centerId: number) => items.filter((row) => row.centerId === centerId),
    [items]
  );

  const isInCart = useCallback(
    (centerId: number, productId: number) =>
      items.some((row) => row.centerId === centerId && row.productId === productId),
    [items]
  );

  const getQuantity = useCallback(
    (centerId: number, productId: number) => {
      const row = items.find(
        (r) => r.centerId === centerId && r.productId === productId
      );
      return row ? row.quantity : 0;
    },
    [items]
  );

  const value = useMemo<ProductCartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, row) => sum + row.quantity, 0),
      total: items.reduce((sum, row) => sum + row.price * row.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      incrementQuantity,
      decrementQuantity,
      clearCenter,
      clearAll,
      itemsByCenter,
      isInCart,
      getQuantity,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      incrementQuantity,
      decrementQuantity,
      clearCenter,
      clearAll,
      itemsByCenter,
      isInCart,
      getQuantity,
    ]
  );

  return (
    <ProductCartContext.Provider value={value}>{children}</ProductCartContext.Provider>
  );
}

export function useProductCart() {
  const ctx = useContext(ProductCartContext);
  if (!ctx) {
    throw new Error("useProductCart must be used within ProductCartProvider");
  }
  return ctx;
}