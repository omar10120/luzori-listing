export interface ProductCartItem {
  key: string;
  productId: number;
  centerId: number;
  centerName: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}
