import {
  buyProducts,
  fetchCartCheckoutPayload,
  fetchUserProfile,
} from "@/lib/api";
import type { BuyProductLine } from "@/lib/apiEndpoints";
import type { ProductCartItem } from "@/lib/productCartTypes";

/** UI payment options. Card checkout maps to API `sales_cash`. */
export type ProductPaymentType = "wallet" | "service_visa";

export const PRODUCT_PAYMENT_TYPES: ProductPaymentType[] = ["wallet", "service_visa"];

export function isProductPaymentType(value: string): value is ProductPaymentType {
  return PRODUCT_PAYMENT_TYPES.includes(value as ProductPaymentType);
}

export type ProductPurchaseResult =
  | { ok: true; message?: string }
  | {
      ok: true;
      needsEmbeddedPayment: true;
      amount: number;
      customerReference: string;
      centerId: number;
      branchId: number;
      products: BuyProductLine[];
      cartItemIds: number[];
      message?: string;
    }
  | {
      ok: false;
      message: string;
      code?: "insufficient_balance" | "empty_cart" | "insufficient_stock" | "missing_branch";
    };

export function cartTotal(items: ProductCartItem[]): number {
  return items.reduce((sum, item) => {
    const lineTotal = Number(item.totalPrice);
    if (Number.isFinite(lineTotal) && lineTotal > 0) return sum + lineTotal;
    return sum + Number(item.price || 0) * (item.quantity || 1);
  }, 0);
}

function resolveBranchId(items: ProductCartItem[], preferred?: number | null): number | null {
  if (preferred != null) {
    const n = Number(preferred);
    if (Number.isFinite(n) && n > 0) return n;
  }
  for (const item of items) {
    const id = Number(item.branchId);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return null;
}

async function loadCheckoutPayload(input: {
  token: string;
  centerId: number;
  items: ProductCartItem[];
  branchId?: number | null;
}): Promise<
  | { ok: true; branchId: number; products: BuyProductLine[]; cartItemIds: number[]; subtotal: number }
  | { ok: false; message: string; code?: "empty_cart" | "missing_branch" }
> {
  const { token, centerId, items } = input;
  const centerItems = items.filter((item) => item.centerId === centerId);
  const branchId = resolveBranchId(centerItems, input.branchId);

  if (!branchId) {
    return { ok: false, message: "missing_branch", code: "missing_branch" };
  }

  const payload = await fetchCartCheckoutPayload(token, {
    center_id: centerId,
    branch_id: branchId,
  });

  if (!payload.success || !payload.data) {
    return { ok: false, message: payload.message || "empty_cart", code: "empty_cart" };
  }

  const products = Array.isArray(payload.data.products) ? payload.data.products : [];
  const cartItemIds = Array.isArray(payload.data.cart_item_ids)
    ? payload.data.cart_item_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0)
    : [];

  if (products.length === 0) {
    return { ok: false, message: "empty_cart", code: "empty_cart" };
  }

  return {
    ok: true,
    branchId: Number(payload.data.branch_id) || branchId,
    products,
    cartItemIds,
    subtotal: Number(payload.data.subtotal) || cartTotal(centerItems),
  };
}

/**
 * Wallet: call buyproducts immediately.
 * service_visa: open MyFatoorah first; call buyproducts with sales_cash after payment success.
 */
export async function purchaseProductsWithPayment(input: {
  token: string;
  centerId: number;
  items: ProductCartItem[];
  paymentType: ProductPaymentType;
  branchId?: number | null;
}): Promise<ProductPurchaseResult> {
  const { token, centerId, items, paymentType } = input;
  const checkout = await loadCheckoutPayload({
    token,
    centerId,
    items,
    branchId: input.branchId,
  });

  if (!checkout.ok) {
    return { ok: false, message: checkout.message, code: checkout.code };
  }

  const { branchId, products, cartItemIds, subtotal } = checkout;

  if (paymentType === "wallet") {
    const profile = await fetchUserProfile(token);
    const wallet = Number(profile?.wallet ?? 0);
    if (wallet < subtotal) {
      return { ok: false, message: "insufficient_balance", code: "insufficient_balance" };
    }

    const result = await buyProducts(token, {
      center_id: centerId,
      branch_id: branchId,
      products,
      payment_type: "wallet",
      sales_worker_id: 1,
      worker_id: null,
      clear_cart: true,
      cart_item_ids: cartItemIds,
    });

    if (!result.success) {
      return {
        ok: false,
        message: result.message || "product_purchase_failed",
        code: result.code === "insufficient_stock" ? "insufficient_stock" : undefined,
      };
    }

    return { ok: true, message: result.message };
  }

  return {
    ok: true,
    needsEmbeddedPayment: true,
    amount: subtotal,
    customerReference: `products-${centerId}-${products.map((p) => `${p.id}x${p.qty}`).join("-")}-${Date.now()}`,
    centerId,
    branchId,
    products,
    cartItemIds,
    message: "payment_start_demo",
  };
}

export async function finalizeProductPurchaseAfterPayment(input: {
  token: string;
  centerId: number;
  branchId: number;
  products: BuyProductLine[];
  cartItemIds?: number[];
}): Promise<{ success: boolean; message: string; code?: "insufficient_stock" }> {
  return buyProducts(input.token, {
    center_id: input.centerId,
    branch_id: input.branchId,
    products: input.products,
    payment_type: "sales_cash",
    sales_worker_id: 1,
    worker_id: null,
    clear_cart: true,
    cart_item_ids: input.cartItemIds,
  });
}
