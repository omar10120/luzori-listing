export interface ProductCartItem {
  /** Cart line id from API (`app_api/cart` item.id). Used as React key. */
  key: string;
  cartItemId: number;
  productId: number;
  centerId: number;
  centerName: string;
  name: string;
  price: number;
  totalPrice?: number;
  image?: string | null;
  quantity: number;
  branchId?: number | null;
  sku?: string | null;
  /** Max available units. `null` / omitted = no stock tracking (client-side hint only). */
  stock?: number | null;
}
