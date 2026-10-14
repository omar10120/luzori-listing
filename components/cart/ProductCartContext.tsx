"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ApiCartItem } from "@/lib/apiEndpoints";
import type { ProductCartItem } from "@/lib/productCartTypes";
import {
  addCartProduct,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api";

export type { ProductCartItem };

export type CartMutationResult = { ok: true } | { ok: false; message: string };

type AddCartInput = {
  productId: number;
  centerId: number;
  centerName?: string;
  name?: string;
  price?: number;
  image?: string | null;
  quantity?: number;
  branchId?: number | null;
  stock?: number | null;
  sku?: string | null;
};

interface ProductCartContextValue {
  items: ProductCartItem[];
  count: number;
  total: number;
  loading: boolean;
  mutating: boolean;
  refreshCart: () => Promise<void>;
  addItem: (item: AddCartInput) => Promise<CartMutationResult>;
  removeItem: (key: string) => Promise<CartMutationResult>;
  updateQuantity: (key: string, quantity: number) => Promise<CartMutationResult>;
  incrementQuantity: (key: string, step?: number) => Promise<CartMutationResult>;
  decrementQuantity: (key: string, step?: number) => Promise<CartMutationResult>;
  clearCenter: (centerId: number) => Promise<CartMutationResult>;
  clearAll: () => Promise<CartMutationResult>;
  itemsByCenter: (centerId: number) => ProductCartItem[];
  isInCart: (centerId: number, productId: number) => boolean;
  getQuantity: (centerId: number, productId: number) => number;
}

const ProductCartContext = createContext<ProductCartContextValue | null>(null);

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

function stockKey(centerId: number, productId: number) {
  return `${centerId}:${productId}`;
}

function getStockLimit(stock: number | null | undefined): number | null {
  if (stock === null || stock === undefined) return null;
  const n = Number(stock);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function mapApiItem(
  item: ApiCartItem,
  stockHints: Map<string, number | null>
): ProductCartItem {
  const productId = Number(item.item_id);
  const centerId = Number(item.center_id);
  const hint = stockHints.get(stockKey(centerId, productId));
  return {
    key: String(item.id),
    cartItemId: Number(item.id),
    productId,
    centerId,
    centerName: item.center?.name || "",
    name: item.name || "",
    price: Number(item.unit_price) || 0,
    totalPrice: Number(item.total_price) || 0,
    image: item.image_url ?? null,
    quantity: Math.max(1, Math.floor(Number(item.qty) || 1)),
    branchId: item.branch_id != null ? Number(item.branch_id) : null,
    sku: item.sku ?? null,
    stock: hint !== undefined ? hint : null,
  };
}

function fail(message: string): CartMutationResult {
  return { ok: false, message };
}

export function ProductCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const stockHintsRef = useRef<Map<string, number | null>>(new Map());
  const itemsRef = useRef<ProductCartItem[]>([]);
  itemsRef.current = items;

  const applyItems = useCallback((apiItems: ApiCartItem[]) => {
    setItems(apiItems.map((row) => mapApiItem(row, stockHintsRef.current)));
  }, []);

  const refreshCart = useCallback(async () => {
    const token = readAuthToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchCart(token, { item_type: "product" });
      if (result.success) applyItems(result.items);
      else setItems([]);
    } finally {
      setLoading(false);
    }
  }, [applyItems]);

  useEffect(() => {
    void refreshCart();

    const onStorage = (event: StorageEvent) => {
      if (event.key === "authToken" || event.key === null) void refreshCart();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshCart]);

  const withMutation = useCallback(
    async (fn: (token: string) => Promise<CartMutationResult>): Promise<CartMutationResult> => {
      const token = readAuthToken();
      if (!token) return fail("login_required");
      setMutating(true);
      try {
        return await fn(token);
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const addItem = useCallback(
    async (item: AddCartInput): Promise<CartMutationResult> => {
      const branchId = Number(item.branchId);
      if (!Number.isFinite(branchId) || branchId <= 0) {
        return fail("missing_branch");
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const limit = getStockLimit(item.stock);
      if (limit != null && limit <= 0) return fail("product_out_of_stock");

      const existing = itemsRef.current.find(
        (row) => row.centerId === item.centerId && row.productId === item.productId
      );
      if (limit != null && existing && existing.quantity + qty > limit) {
        return fail("product_stock_limit_reached_short");
      }

      stockHintsRef.current.set(
        stockKey(item.centerId, item.productId),
        limit
      );

      return withMutation(async (token) => {
        const result = await addCartProduct(token, {
          center_id: item.centerId,
          branch_id: branchId,
          product_id: item.productId,
          qty,
        });
        if (!result.success) return fail(result.message || "cart_add_failed");
        const list = await fetchCart(token, { item_type: "product" });
        if (list.success) applyItems(list.items);
        return { ok: true };
      });
    },
    [applyItems, withMutation]
  );

  const removeItem = useCallback(
    async (key: string): Promise<CartMutationResult> => {
      const target = itemsRef.current.find((row) => row.key === key);
      if (!target) return { ok: true };
      return withMutation(async (token) => {
        const result = await removeCartItem(token, target.cartItemId);
        if (!result.success) return fail(result.message || "cart_remove_failed");
        const list = await fetchCart(token, { item_type: "product" });
        if (list.success) applyItems(list.items);
        return { ok: true };
      });
    },
    [applyItems, withMutation]
  );

  const updateQuantity = useCallback(
    async (key: string, quantity: number): Promise<CartMutationResult> => {
      const target = itemsRef.current.find((row) => row.key === key);
      if (!target) return fail("cart_item_missing");

      let next = Math.floor(quantity);
      if (!Number.isFinite(next) || next < 1) {
        return removeItem(key);
      }

      const limit = getStockLimit(target.stock);
      if (limit != null) next = Math.min(next, limit);
      if (next < 1) return removeItem(key);
      if (next === target.quantity) return { ok: true };

      return withMutation(async (token) => {
        const result = await updateCartItem(token, target.cartItemId, next);
        if (!result.success) return fail(result.message || "cart_update_failed");
        const list = await fetchCart(token, { item_type: "product" });
        if (list.success) applyItems(list.items);
        return { ok: true };
      });
    },
    [applyItems, removeItem, withMutation]
  );

  const incrementQuantity = useCallback(
    async (key: string, step = 1): Promise<CartMutationResult> => {
      const target = itemsRef.current.find((row) => row.key === key);
      if (!target) return fail("cart_item_missing");
      const limit = getStockLimit(target.stock);
      if (limit != null && target.quantity >= limit) {
        return fail("product_stock_limit_reached_short");
      }
      return updateQuantity(key, target.quantity + step);
    },
    [updateQuantity]
  );

  const decrementQuantity = useCallback(
    async (key: string, step = 1): Promise<CartMutationResult> => {
      const target = itemsRef.current.find((row) => row.key === key);
      if (!target) return fail("cart_item_missing");
      const next = target.quantity - step;
      if (next < 1) return removeItem(key);
      return updateQuantity(key, next);
    },
    [removeItem, updateQuantity]
  );

  const clearCenter = useCallback(
    async (centerId: number): Promise<CartMutationResult> => {
      return withMutation(async (token) => {
        const result = await clearCart(token, { center_id: centerId });
        if (!result.success) return fail(result.message || "cart_clear_failed");
        const list = await fetchCart(token, { item_type: "product" });
        if (list.success) applyItems(list.items);
        return { ok: true };
      });
    },
    [applyItems, withMutation]
  );

  const clearAll = useCallback(async (): Promise<CartMutationResult> => {
    return withMutation(async (token) => {
      const result = await clearCart(token);
      if (!result.success) return fail(result.message || "cart_clear_failed");
      applyItems([]);
      return { ok: true };
    });
  }, [applyItems, withMutation]);

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
      total: items.reduce(
        (sum, row) => sum + (Number(row.totalPrice) || row.price * row.quantity),
        0
      ),
      loading,
      mutating,
      refreshCart,
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
      loading,
      mutating,
      refreshCart,
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
