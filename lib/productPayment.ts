import { buyProducts, fetchUserProfile } from "@/lib/api";
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
      message?: string;
    }
  | {
      ok: false;
      message: string;
      code?: "insufficient_balance" | "empty_cart" | "insufficient_stock" | "missing_branch";
    };

export function cartTotal(items: ProductCartItem[]): number {
  return items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
}

function toBuyLines(items: ProductCartItem[]): BuyProductLine[] {
  const map = new Map<number, number>();
  for (const item of items) {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    map.set(item.productId, (map.get(item.productId) || 0) + qty);
  }
  return Array.from(map.entries()).map(([id, qty]) => ({ id, qty }));
}

function resolveBranchId(items: ProductCartItem[]): number | null {
  for (const item of items) {
    const id = Number(item.branchId);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return null;
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
}): Promise<ProductPurchaseResult> {
  const { token, centerId, items, paymentType } = input;
  const centerItems = items.filter((item) => item.centerId === centerId);
  const products = toBuyLines(centerItems);
  const branchId = resolveBranchId(centerItems) ?? 1;

  if (products.length === 0) {
    return { ok: false, message: "empty_cart", code: "empty_cart" };
  }

  const totalPrice = cartTotal(centerItems);

  if (paymentType === "wallet") {
    const profile = await fetchUserProfile(token);
    const wallet = Number(profile?.wallet ?? 0);
    if (wallet < totalPrice) {
      return { ok: false, message: "insufficient_balance", code: "insufficient_balance" };
    }

    const result = await buyProducts(token, {
      center_id: centerId,
      branch_id: branchId,
      products,
      payment_type: "wallet",
      sales_worker_id: 1,
      worker_id: null,
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
    amount: totalPrice,
    customerReference: `products-${centerId}-${products.map((p) => `${p.id}x${p.qty}`).join("-")}-${Date.now()}`,
    centerId,
    branchId,
    products,
    message: "payment_start_demo",
  };
}

export async function finalizeProductPurchaseAfterPayment(input: {
  token: string;
  centerId: number;
  branchId: number;
  products: BuyProductLine[];
}): Promise<{ success: boolean; message: string; code?: "insufficient_stock" }> {
  return buyProducts(input.token, {
    center_id: input.centerId,
    branch_id: input.branchId,
    products: input.products,
    payment_type: "sales_cash",
    sales_worker_id: 1,
    worker_id: null,
  });
}
