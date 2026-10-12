import { buyProducts, fetchUserProfile } from "@/lib/api";
import type { ProductCartItem } from "@/lib/productCartTypes";

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
      productIds: number[];
      message?: string;
    }
  | {
      ok: false;
      message: string;
      code?: "insufficient_balance" | "empty_cart";
    };

export function cartTotal(items: ProductCartItem[]): number {
  return items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
}

/**
 * Wallet: call buyproducts immediately.
 * service_visa: open MyFatoorah first; call buyproducts only after payment success.
 */
export async function purchaseProductsWithPayment(input: {
  token: string;
  centerId: number;
  items: ProductCartItem[];
  paymentType: ProductPaymentType;
}): Promise<ProductPurchaseResult> {
  const { token, centerId, items, paymentType } = input;
  const centerItems = items.filter((item) => item.centerId === centerId);
  const productIds = [...new Set(centerItems.map((item) => item.productId))];

  if (productIds.length === 0) {
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
      products: productIds,
      payment_type: "wallet",
      sales_worker_id: 1,
    });

    if (!result.success) {
      return { ok: false, message: result.message || "product_purchase_failed" };
    }

    return { ok: true, message: result.message };
  }

  return {
    ok: true,
    needsEmbeddedPayment: true,
    amount: totalPrice,
    customerReference: `products-${centerId}-${productIds.join("-")}-${Date.now()}`,
    centerId,
    productIds,
    message: "payment_start_demo",
  };
}

export async function finalizeProductPurchaseAfterPayment(input: {
  token: string;
  centerId: number;
  productIds: number[];
}): Promise<{ success: boolean; message: string }> {
  return buyProducts(input.token, {
    center_id: input.centerId,
    products: input.productIds,
    payment_type: "service_visa",
    sales_worker_id: 1,
  });
}
