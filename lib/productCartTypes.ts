export interface ProductCartItem {
  key: string;
  productId: number;
  centerId: number;
  centerName: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
  /** Branch used for buyproducts/add. */
  branchId?: number | null;
  /** Max available units. `null` / omitted = no stock tracking. */
  stock?: number | null;
}
